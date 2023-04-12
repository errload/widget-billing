<?php

    $update = '
        UPDATE billing_timer
        SET time_start = "",
            status = "stop",
            time_work = "01.01.2000 23:59:59"
        WHERE id = "' . $_POST['timer_ID'] . '"
    ';

    $mysqli->query($update);

    print_r(json_encode([]));