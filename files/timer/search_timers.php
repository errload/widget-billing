<?php

    $select = '
        SELECT * 
        FROM billing_timer 
        WHERE user_id = "' . $_POST['user_ID'] . '" 
            AND essence_id = "' . $_POST['essense_ID'] . '"
            AND status != "finish"
    ';

    $results = $mysqli->query($select)->fetch_all();

    if (!count($results)) $response = [];
    else {
        foreach ($results as $result) {
            // считаем разницу у запущенного таймера
            if ($result[13] === 'pause') {
                $response[] = ['status' => $result[13], 'time_work' => explode(' ', $result[12])[1]];
            }
            else if ($result[13] === 'stop') {
                $response[] = ['status' => $result[13], 'time_work' => explode(' ', $result[12])[1]];
            }
            else if ($result[13] === 'start') {
                // разнца между стартом и текущим временем
                $time_start = new DateTime($result[11], new DateTimeZone($result[10]));
                $time_now = new DateTime('now', new DateTimeZone($result[10]));
                $time_diff = $time_now->diff($time_start);

                // добавляем разницу к таймеру
                $time_work = new DateTime($result[12]);
                $date_interval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
                $time_work->add($date_interval)->format('d.m.Y H:i:s');

                $response[] = ['status' => $result[13], 'time_work' => $time_work->format('H:i:s')];

            } else $response = [];
        }
    }

    print_r(json_encode($response));
