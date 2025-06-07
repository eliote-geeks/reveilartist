<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'status',
        'views_count',
        'likes_count',
        'comments_count'
    ];

    protected $casts = [
        'views_count' => 'integer',
        'likes_count' => 'integer',
        'comments_count' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
