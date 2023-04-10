<?php

    include_once 'config.php';

    use AmoCRM\Exceptions\AmoCRMApiException;
    use AmoCRM\Models\LeadModel;
    use AmoCRM\Models\Customers\CustomerModel;

    $Config = new Config();

    // ищем ID сущности в покупателях
    $is_customer = true;

    try {
        $customer = $apiClient->customers()->getOne($_POST['essence_ID'], [LeadModel::CONTACTS]);
    } catch (AmoCRMApiException $e) {}

    // если такой сущности нет, ищем в сделках
    if (!$customer) {
        $is_customer = false;

        try {
            $customer = $apiClient->leads()->getOne($_POST['essence_ID'], [CustomerModel::CONTACTS]);
        } catch (AmoCRMApiException $e) {}
    }

    // если не нашли, выходим
    if (!$customer) $results = [];
    else {
        $contacts = $customer->getContacts();

        if (!$contacts) $results = [];
        else {
            $results = [];

            // находим контакты по ID и добавляем в массив
            foreach ($contacts as $contact) {
                try {
                    $contact = $apiClient->contacts()->getOne($contact->id);
                } catch (AmoCRMApiException $e) {}

                $results[] = [$contact->getId(), $contact->getName()];
            }

        }
    }

    print_r(json_encode($results));