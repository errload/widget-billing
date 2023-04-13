<?php

    $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['history_ID'] . '"';
    $result = $mysqli->query($select)->fetch_assoc();
    print_r(json_encode($result));
