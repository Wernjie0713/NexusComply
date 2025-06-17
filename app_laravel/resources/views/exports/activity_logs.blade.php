<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="page-size" content="A4">
    <title>{{ $title }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            text-align: left;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Date/Time</th>
                <th>Action Type</th>
                <th>Target Type</th>
                <th>Details</th>
                <th>User</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
                <tr>
                    <td>{{ $row['No.'] }}</td>
                    <td>{{ $row['Date/Time'] }}</td>
                    <td>{{ $row['Action Type'] }}</td>
                    <td>{{ $row['Target Type'] }}</td>
                    <td>{{ $row['Details'] }}</td>
                    <td>{{ $row['User'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>