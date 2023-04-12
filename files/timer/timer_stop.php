<?php

    $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['timer_ID'] . '"';
    $result = $mysqli->query($select)->fetch_assoc();

    if ($result['status'] === 'stop') return;

    if ($result['status'] === 'start') {
        // разнца между стартом и паузой
        $time_start = new DateTime($result['time_start'], new DateTimeZone($result['timezone']));
        $time_now = new DateTime('now', new DateTimeZone($result['timezone']));
        $time_diff = $time_now->diff($time_start);

        // добавляем разницу к таймеру
        $time_work = new DateTime($result['time_work']);
        $date_interval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
        $time_work->add($date_interval)->format('d.m.Y H:i:s');

        // если разница больше суток, дату ставим 23:59:59 как максимальную
        if ($time_work->format('d.m.Y') !== '01.01.2000') {
            $time_work = new DateTime('01.01.2000 23:59:59');
        }

    } else $time_work = new DateTime($result['time_work']);

    // обновляем состояние таймера
    $update = '
        UPDATE billing_timer
        SET time_start = "",
            status = "stop",
            time_work = "' . $time_work->format('d.m.Y H:i:s') . '"
        WHERE id = "' . $_POST['timer_ID'] . '"
    ';

    $mysqli->query($update);

    print_r(json_encode([]));
