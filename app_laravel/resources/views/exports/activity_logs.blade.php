<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $title }}</title>
    <style>
        body { 
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            margin: 0;
            padding: 10px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold;
        }
        .header { 
            margin-bottom: 15px; 
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
        }
        .header p {
            margin: 3px 0 0 0;
            font-size: 10px;
        }
        .footer { 
            margin-top: 15px; 
            font-size: 9px; 
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on: {{ $date }}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                @foreach(array_keys($data[0] ?? []) as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
                <tr>
                    @foreach($row as $value)
                        <td>{{ $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        <p>NexusComply - Activity Logs Export</p>
    </div>
</body>
</html>