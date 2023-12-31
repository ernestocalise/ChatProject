<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
class SystemUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => "SYSTEM",
            'email' => "SYSTEM@CHATAPPLICATION.IT",
            'password' => Hash::make('password'),
        ]);
        DB::table('users')
              ->where('id', 1)
              ->update(['id' => 0]);
    }
}
