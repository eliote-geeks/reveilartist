<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sound extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'description',
        'user_id',
        'category_id',
        'file_path',
        'cover_image',
        'duration',
        'genre',
        'price',
        'is_free',
        'is_featured',
        'status',
        'tags',
        'bpm',
        'key',
        'credits',
        // Nouveaux champs pour les licences et droits d'auteur
        'license_type',
        'copyright_owner',
        'composer',
        'performer',
        'producer',
        'release_date',
        'isrc_code',
        'publishing_rights',
        'usage_rights',
        'commercial_use',
        'attribution_required',
        'modifications_allowed',
        'distribution_allowed',
        'license_duration',
        'territory',
        'rights_statement',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_free' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'array',
            'usage_rights' => 'array',
            'price' => 'decimal:2',
            'commercial_use' => 'boolean',
            'attribution_required' => 'boolean',
            'modifications_allowed' => 'boolean',
            'distribution_allowed' => 'boolean',
            'release_date' => 'date',
        ];
    }

    /**
     * Boot du modèle pour générer automatiquement le slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sound) {
            if (empty($sound->slug)) {
                $sound->slug = Str::slug($sound->title);
            }
        });

        static::updating(function ($sound) {
            if ($sound->isDirty('title') && empty($sound->slug)) {
                $sound->slug = Str::slug($sound->title);
            }
        });
    }

    /**
     * Relation vers l'utilisateur créateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation vers la catégorie
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relation vers les paiements (ventes de ce son)
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Utilisateurs qui ont aimé ce son
     */
    public function likes()
    {
        return $this->belongsToMany(User::class, 'sound_likes', 'sound_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Utilisateurs qui ont mis ce son en favori
     */
    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorite_sounds', 'sound_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Compter le nombre de likes
     */
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    /**
     * Scope pour les sons publiés
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope pour les sons en vedette
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope pour les sons gratuits
     */
    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    /**
     * Accesseur pour l'URL du fichier audio
     */
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Accesseur pour l'URL de l'image de couverture
     */
    public function getCoverImageUrlAttribute()
    {
        if ($this->cover_image) {
            return asset('storage/' . $this->cover_image);
        }

        // Image par défaut basée sur la catégorie
        return "https://ui-avatars.com/api/?name=" . urlencode($this->title) . "&color=7F9CF5&background=EBF4FF&size=300";
    }

    /**
     * Accesseur pour la durée formatée
     */
    public function getFormattedDurationAttribute()
    {
        if (!$this->duration) {
            return '0:00';
        }

        $minutes = floor($this->duration / 60);
        $seconds = $this->duration % 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Accesseur pour le prix formaté
     */
    public function getFormattedPriceAttribute()
    {
        if ($this->is_free) {
            return 'Gratuit';
        }

        return number_format($this->price, 0, ',', ' ') . ' XAF';
    }

    /**
     * Incrémenter le nombre de lectures
     */
    public function incrementPlays()
    {
        $this->increment('plays_count');
    }

    /**
     * Incrémenter le nombre de téléchargements
     */
    public function incrementDownloads()
    {
        $this->increment('downloads_count');
    }

    /**
     * Incrémenter le nombre de likes
     */
    public function incrementLikes()
    {
        $this->increment('likes_count');
    }
}
