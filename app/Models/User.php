<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'bio',
        'location',
        'status',
        'last_login_at',
        'profile_photo_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Scope pour filtrer par rôle
     */
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope pour filtrer par statut
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Vérifier si l'utilisateur est un artiste
     */
    public function isArtist()
    {
        return $this->role === 'artist';
    }

    /**
     * Vérifier si l'utilisateur est un producteur
     */
    public function isProducer()
    {
        return $this->role === 'producer';
    }

    /**
     * Vérifier si l'utilisateur est actif
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Obtenir le nom d'affichage du rôle
     */
    public function getRoleDisplayNameAttribute()
    {
        $roles = [
            'user' => 'Utilisateur',
            'artist' => 'Artiste',
            'producer' => 'Producteur',
            'admin' => 'Administrateur'
        ];

        return $roles[$this->role] ?? 'Utilisateur';
    }

    /**
     * Obtenir le nom d'affichage du statut
     */
    public function getStatusDisplayNameAttribute()
    {
        $statuses = [
            'active' => 'Actif',
            'suspended' => 'Suspendu',
            'pending' => 'En attente'
        ];

        return $statuses[$this->status] ?? 'Actif';
    }

    /**
     * Obtenir l'URL de la photo de profil personnalisée
     */
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo_path) {
            return asset('storage/' . $this->profile_photo_path);
        }

        // Générer une photo par défaut avec les initiales
        $initials = strtoupper(substr($this->name, 0, 1));
        return "https://ui-avatars.com/api/?name=" . urlencode($this->name) . "&color=7F9CF5&background=EBF4FF&size=200";
    }
}
