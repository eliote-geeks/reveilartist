<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Competition extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'entry_fee',
        'max_participants',
        'start_date',
        'start_time',
        'duration',
        'rules',
        'prizes',
        'judging_criteria',
        'image_path',
        'status',
        'current_participants',
        'is_active',
        'total_prize_pool',
        'registration_deadline',
        'user_id',
    ];

    protected $casts = [
        'rules' => 'array',
        'prizes' => 'array',
        'judging_criteria' => 'array',
        'entry_fee' => 'decimal:2',
        'total_prize_pool' => 'decimal:2',
        'start_date' => 'date',
        'start_time' => 'datetime:H:i',
        'registration_deadline' => 'datetime',
        'is_active' => 'boolean',
        'max_participants' => 'integer',
        'current_participants' => 'integer',
        'duration' => 'integer',
    ];

    /**
     * Relation avec l'utilisateur (organisateur)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec les participants
     */
    public function participants(): HasMany
    {
        return $this->hasMany(CompetitionParticipant::class);
    }

    /**
     * Participants confirmés
     */
    public function confirmedParticipants()
    {
        return $this->participants()->where('status', 'confirmed');
    }

    /**
     * Gagnants de la compétition
     */
    public function winners()
    {
        return $this->participants()->where('status', 'winner')->orderBy('position');
    }

    /**
     * Scope pour les compétitions actives
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour les compétitions par statut
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope pour les compétitions par catégorie
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope pour rechercher des compétitions
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('category', 'like', "%{$search}%");
        });
    }

    /**
     * Scope pour les compétitions à venir
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', now()->toDateString())
                    ->where('status', 'published');
    }

    /**
     * Scope pour les compétitions en cours
     */
    public function scopeOngoing($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope pour les compétitions terminées
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Obtenir l'URL complète de l'image
     */
    public function getImageUrlAttribute()
    {
        return $this->image_path ? Storage::url($this->image_path) : null;
    }

    /**
     * Obtenir la date et heure de début combinées
     */
    public function getStartDateTimeAttribute()
    {
        return Carbon::parse($this->start_date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s'));
    }

    /**
     * Obtenir la date et heure de fin
     */
    public function getEndDateTimeAttribute()
    {
        return $this->start_date_time->addMinutes($this->duration);
    }

    /**
     * Vérifier si la compétition est pleine
     */
    public function isFullAttribute()
    {
        return $this->current_participants >= $this->max_participants;
    }

    /**
     * Vérifier si les inscriptions sont ouvertes
     */
    public function canRegisterAttribute()
    {
        return $this->status === 'published'
            && !$this->is_full
            && ($this->registration_deadline ? now() <= $this->registration_deadline : true)
            && $this->start_date_time > now();
    }

    /**
     * Vérifier si la compétition est en cours
     */
    public function isOngoingAttribute()
    {
        return $this->status === 'active'
            && now() >= $this->start_date_time
            && now() <= $this->end_date_time;
    }

    /**
     * Vérifier si la compétition est terminée
     */
    public function isFinishedAttribute()
    {
        return $this->status === 'completed' || now() > $this->end_date_time;
    }

    /**
     * Calculer la cagnotte totale
     */
    public function calculateTotalPrizePool()
    {
        return $this->entry_fee * $this->current_participants;
    }

    /**
     * Mettre à jour la cagnotte totale
     */
    public function updateTotalPrizePool()
    {
        $this->update(['total_prize_pool' => $this->calculateTotalPrizePool()]);
    }

    /**
     * Ajouter un participant
     */
    public function addParticipant($userId, $entryFeePaid = 0)
    {
        if ($this->can_register) {
            $participant = $this->participants()->create([
                'user_id' => $userId,
                'entry_fee_paid' => $entryFeePaid,
                'payment_status' => $entryFeePaid >= $this->entry_fee ? 'paid' : 'pending'
            ]);

            $this->increment('current_participants');
            $this->updateTotalPrizePool();

            return $participant;
        }

        return false;
    }

    /**
     * Retirer un participant
     */
    public function removeParticipant($userId)
    {
        $participant = $this->participants()->where('user_id', $userId)->first();

        if ($participant) {
            $participant->delete();
            $this->decrement('current_participants');
            $this->updateTotalPrizePool();
            return true;
        }

        return false;
    }

    /**
     * Vérifier si un utilisateur participe
     */
    public function hasParticipant($userId)
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }

    /**
     * Obtenir les prix en montants réels
     */
    public function getPrizeAmountsAttribute()
    {
        $prizeAmounts = [];
        $totalPool = $this->total_prize_pool;

        foreach ($this->prizes as $prize) {
            $prizeAmounts[] = [
                'position' => $prize['position'],
                'label' => $prize['label'],
                'percentage' => $prize['percentage'],
                'amount' => ($totalPool * $prize['percentage']) / 100
            ];
        }

        return $prizeAmounts;
    }

    /**
     * Formater le montant des frais d'inscription
     */
    public function getFormattedEntryFeeAttribute()
    {
        return number_format($this->entry_fee, 0, ',', ' ') . ' XAF';
    }

    /**
     * Formater le montant de la cagnotte
     */
    public function getFormattedTotalPrizePoolAttribute()
    {
        return number_format($this->total_prize_pool, 0, ',', ' ') . ' XAF';
    }

    /**
     * Obtenir le statut en français
     */
    public function getStatusLabelAttribute()
    {
        $statuses = [
            'draft' => 'Brouillon',
            'published' => 'Publiée',
            'active' => 'En cours',
            'completed' => 'Terminée',
            'cancelled' => 'Annulée'
        ];

        return $statuses[$this->status] ?? 'Inconnu';
    }

    /**
     * Obtenir la durée formatée
     */
    public function getFormattedDurationAttribute()
    {
        $hours = intdiv($this->duration, 60);
        $minutes = $this->duration % 60;

        if ($hours > 0) {
            return $hours . 'h' . ($minutes > 0 ? sprintf('%02d', $minutes) : '');
        }

        return $minutes . ' min';
    }
}
