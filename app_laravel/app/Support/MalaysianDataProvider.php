<?php

namespace App\Support;

class MalaysianDataProvider
{
    private static array $outletPrefixes = [
        'Kedai', 'Restoran', 'Klinik', 'Pusat', 'Farmasi', 'Bengkel', 'Pasar Mini', 'Butik',
        'Salon', 'Kedai Serbaneka', 'Klinik Pergigian', 'Pusat Tuisyen'
    ];

    private static array $outletNames = [
        'Maju Jaya', 'Cemerlang', 'Sejahtera', 'Bahagia', 'Berjaya', 'Harmoni', 'Sentosa',
        'Mutiara', 'Gemilang', 'Cahaya', 'Indah', 'Damai', 'Makmur', 'Jaya Murni'
    ];

    private static array $streetTypes = [
        'Jalan', 'Lorong', 'Persiaran', 'Lebuh', 'Jalan Besar', 'Lingkaran'
    ];

    private static array $areas = [
        'Taman', 'Bandar', 'Kampung', 'Seksyen', 'Desa', 'Medan', 'Kompleks'
    ];

    private static array $areaNames = [
        'Sri', 'Perdana', 'Cahaya', 'Indah', 'Harmoni', 'Damai', 'Sentosa', 'Bahagia',
        'Maju', 'Jaya', 'Mutiara', 'Gemilang', 'Setia', 'Utama', 'Desa'
    ];

    private static array $cities = [
        'Shah Alam' => 'Selangor',
        'Petaling Jaya' => 'Selangor',
        'Subang Jaya' => 'Selangor',
        'Ipoh' => 'Perak',
        'Georgetown' => 'Pulau Pinang',
        'Johor Bahru' => 'Johor',
        'Kuantan' => 'Pahang',
        'Kuching' => 'Sarawak',
        'Kota Kinabalu' => 'Sabah',
        'Melaka' => 'Melaka',
        'Seremban' => 'Negeri Sembilan',
        'Alor Setar' => 'Kedah',
        'Kuala Terengganu' => 'Terengganu'
    ];

    private static array $maleNames = [
        'Abdullah', 'Ahmad', 'Mohammed', 'Ismail', 'Ibrahim', 'Razak', 'Hassan', 'Yusof',
        'Aziz', 'Kamal', 'Zulkifli', 'Nasir', 'Hamzah', 'Zainal'
    ];

    private static array $femaleNames = [
        'Siti', 'Nurul', 'Fatimah', 'Zainab', 'Aminah', 'Khadijah', 'Aishah', 'Noraini',
        'Zuraidah', 'Farah', 'Nadia', 'Sarah', 'Yasmin', 'Lily'
    ];

    private static array $lastNames = [
        'bin Abdullah', 'bin Ahmad', 'bin Mohammed', 'binti Ibrahim', 'binti Hassan',
        'Lim', 'Tan', 'Wong', 'Lee', 'Ng', 'Chong', 'a/l Raj', 'a/p Kumar',
        'Raj', 'Kumar', 'Singh', 'Kaur'
    ];

    public static function generateOutletName(): string
    {
        $prefix = self::$outletPrefixes[array_rand(self::$outletPrefixes)];
        $name = self::$outletNames[array_rand(self::$outletNames)];
        
        // 30% chance to add a location suffix
        if (rand(1, 100) <= 30) {
            $area = self::$areas[array_rand(self::$areas)];
            $areaName = self::$areaNames[array_rand(self::$areaNames)];
            return "{$prefix} {$name} {$area} {$areaName}";
        }
        
        return "{$prefix} {$name}";
    }

    public static function generateAddress(): array
    {
        $streetNo = rand(1, 150);
        $streetType = self::$streetTypes[array_rand(self::$streetTypes)];
        $areaName = self::$areaNames[array_rand(self::$areaNames)];
        
        $area = self::$areas[array_rand(self::$areas)];
        $areaName2 = self::$areaNames[array_rand(self::$areaNames)];
        
        $cityKey = array_rand(self::$cities);
        $city = $cityKey;
        $state = self::$cities[$cityKey];
        
        // Generate a valid Malaysian postcode
        $postcode = self::generatePostcode($state);
        
        $address = "{$streetNo}, {$streetType} {$areaName}, {$area} {$areaName2}";
        
        return [
            'address' => $address,
            'city' => $city,
            'state' => $state,
            'postcode' => $postcode
        ];
    }

    public static function generatePhoneNumber(): string
    {
        $types = [
            '01' => [1, 2, 3, 4, 5, 6, 7, 8, 9], // Mobile
            '03' => [], // Klang Valley landline
            '04' => [], // Northern region landline
            '05' => [], // Perak landline
            '06' => [], // Melaka/N.Sembilan landline
            '07' => [], // Johor landline
            '09' => [], // East Coast landline
        ];

        $prefix = array_rand($types);
        if ($prefix === '01') {
            $secondDigit = $types[$prefix][array_rand($types[$prefix])];
            $remainingLength = 7;
            $remaining = str_pad(rand(0, pow(10, $remainingLength) - 1), $remainingLength, '0', STR_PAD_LEFT);
            return "{$prefix}{$secondDigit}-{$remaining}";
        } else {
            $remainingLength = 7;
            $remaining = str_pad(rand(0, pow(10, $remainingLength) - 1), $remainingLength, '0', STR_PAD_LEFT);
            return "{$prefix}-{$remaining}";
        }
    }

    private static function generatePostcode(string $state): string
    {
        $statePrefixes = [
            'Selangor' => ['40', '41', '42', '43', '44', '45', '46', '47', '48'],
            'Perak' => ['30', '31', '32', '33', '34', '35', '36'],
            'Pulau Pinang' => ['10', '11', '12', '13', '14'],
            'Johor' => ['80', '81', '82', '83', '84', '85', '86'],
            'Pahang' => ['25', '26', '27', '28'],
            'Sarawak' => ['93', '94', '95', '96', '97', '98'],
            'Sabah' => ['88', '89', '90', '91'],
            'Melaka' => ['75', '76', '77', '78'],
            'Negeri Sembilan' => ['70', '71', '72', '73'],
            'Kedah' => ['05', '06', '07', '08', '09'],
            'Terengganu' => ['20', '21', '22', '23', '24']
        ];

        $prefix = $statePrefixes[$state][array_rand($statePrefixes[$state])];
        $suffix = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        
        return "{$prefix}{$suffix}";
    }

    public static function generateMalaysianName(bool $isFemale = null): string
    {
        if ($isFemale === null) {
            $isFemale = (bool)rand(0, 1);
        }

        $firstName = $isFemale 
            ? self::$femaleNames[array_rand(self::$femaleNames)]
            : self::$maleNames[array_rand(self::$maleNames)];
        
        $lastName = self::$lastNames[array_rand(self::$lastNames)];
        
        return "{$firstName} {$lastName}";
    }

    public static function generateOperatingHours(): array
    {
        return [
            ['day' => 'Monday', 'isOpen' => true, 'openTime' => '09:00', 'closeTime' => '18:00'],
            ['day' => 'Tuesday', 'isOpen' => true, 'openTime' => '09:00', 'closeTime' => '18:00'],
            ['day' => 'Wednesday', 'isOpen' => true, 'openTime' => '09:00', 'closeTime' => '18:00'],
            ['day' => 'Thursday', 'isOpen' => true, 'openTime' => '09:00', 'closeTime' => '18:00'],
            ['day' => 'Friday', 'isOpen' => true, 'openTime' => '09:00', 'closeTime' => '18:00'],
            ['day' => 'Saturday', 'isOpen' => true, 'openTime' => '10:00', 'closeTime' => '15:00'],
            ['day' => 'Sunday', 'isOpen' => false, 'openTime' => '', 'closeTime' => '']
        ];
    }
} 