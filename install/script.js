// billing
define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function($, _, Twig, Modal) {
    var CustomWidget_WidgetBilling = function() {
        var self = this,
            system = self.system,
            url_link_t = 'https://integratorgroup.k-on.ru/andreev/billing/templates.php';

        // активные таймеры
        // this.timer = {};
        // this.history = null;
        this.config_settings = {};

        // получение настроек
        this.getConfigSettings = function () {
            var config_settings = self.get_settings().config_settings || {};
            if (typeof config_settings !== 'string') config_settings = JSON.stringify(config_settings);
            config_settings = JSON.parse(config_settings);
            self.config_settings = config_settings;
        }

        // сохранение настроек
        this.saveConfigSettings = function () {
            $(`#${ self.get_settings().widget_code }_custom`).val(JSON.stringify(self.config_settings));
            $(`#${ self.get_settings().widget_code }_custom`).trigger('change');
        }






//         // запуск истории
//         $('.hystory__link').unbind('click');
//         $('.hystory__link').bind('click', function (e) {
//             e.preventDefault();
//
//             // получаем данные
//             var _data = {};
//             _data['domain'] = document.domain;
//             _data['method'] = 'hystory';
//             _data['essence_id'] = AMOCRM.data.current_card.id;
//             $.ajax({
//                 url: url_link_t,
//                 method: 'post',
//                 data: _data,
//                 dataType: 'json',
//                 success: function(data) {
//                     var deposit = 0;
//                     self.history = null;
//                     self.history = data.history;
//                     if (data.deposit) deposit = data.deposit;
//
//                     new Modal({
//                         class_name: 'hystory__timer',
//                         init: function ($modal_body) {
//                             var $this = $(this);
//                             $modal_body
//                                 .trigger('modal:loaded')
//                                 .html(`
//                                     <div class="modal__hystory-block" style="width: 100%; height: 600px;">
//                                         <h2 class="modal-body__caption head_2">История</h2>
//                                     </div>
//                                 `)
//                                 .trigger('modal:centrify')
//                                 .append('');
//                         },
//                         destroy: function () {}
//                     });
//                     $('.hystory__timer .modal-body').css('overflow', 'auto');
//
//                     // депозит
//                     var inputHystoryDeposit = Twig({ ref: '/tmpl/controls/input.twig' }).render({
//                         name: 'modal-input-hystory-deposit',
//                         class_name: 'modal__input__hystory-deposit',
//                         value: deposit,
//                         placeholder: 'укажите сумму депозита'
//                     });
//
//                     var HystoryDepositWrapper = `<div class="modal__hystory-deposit__wrapper" style="width: 100%; margin-top: 20px;">
//                         <span >Сумма депозита:</span>
//                     </div>`;
//
//                     $('.modal__hystory-block').append(HystoryDepositWrapper);
//                     $('.modal__hystory-deposit__wrapper').append(inputHystoryDeposit);
//                     $('.modal__input__hystory-deposit').css('margin-bottom', '10px');
//
//                     // редактирование депозита
//                     var deposit = $('.modal__input__hystory-deposit');
//                     deposit.bind('input', () => deposit.css('border-color', '#dbdedf'));
//
//                     deposit.unbind('change');
//                     deposit.bind('change', function () {
//                         var _data = {};
//                         _data['domain'] = document.domain;
//                         _data['method'] = 'change_deposit';
//                         _data['essence_id'] = AMOCRM.data.current_card.id;
//                         _data['deposit'] = deposit.val().trim();
//                         $.ajax({
//                             url: url_link_t,
//                             method: 'post',
//                             data: _data,
//                             dataType: 'json',
//                             success: function (data) {
//                                 // обновляем значение депозита
//                                 deposit.val(data);
//
//                                 // красим поле в зеленый цвет
//                                 deposit.css({ 'transition-duration': '0s', 'border-color': '#2bd153' });
//                                 setTimeout(() => {
//                                     deposit.css({
//                                         'transition-duration': '1s',
//                                         'border-color': '#dbdedf'
//                                     });
//                                 }, 1000);
//                             }
//                         });
//                     });
//
//                     if (self.history) {
//                         // клик по конкретной истории таймера для детального просмотра
//                         const showDetails = function (e) {
//                             var historyID = $(e.target).attr('data-id');
//                             if (!historyID) historyID = $(e.target).closest('.link-details').attr('data-id');
//
//                             $.each(self.history, function () {
//                                 if (this.id !== historyID) return;
//                                 console.log(this);
//
//                                 new Modal({
//                                     class_name: 'hystory__details',
//                                     init: function ($modal_body) {
//                                         var $this = $(this);
//                                         $modal_body
//                                             .trigger('modal:loaded')
//                                             .html(`
//                                                 <div class="modal__hystory-details" style="width: 100%; min-height: 400px;">
//                                                     <h2 class="modal-body__caption head_2">Детализация</h2>
//                                                 </div>
//                                             `)
//                                             .trigger('modal:centrify')
//                                             .append('');
//                                     },
//                                     destroy: function () {}
//                                 });
//
//                                 // кнопка Закрыть
//                                 $('.modal__hystory-details').css('position', 'relative');
//                                 detailsCancelBtn = `
//                                     <a href="#" class="details__cancel__btn" style="
//                                         text-decoration: none;
//                                         color: #92989b;
//                                         font-size: 14px;
//                                         font-weight: bold;
//                                         top: 3px;
//                                         right: 0;
//                                         position: absolute;
//                                     ">Закрыть</a>
//                                 `;
//                                 $('.modal__hystory-details').append(detailsCancelBtn);
//                                 $('.details__cancel__btn').bind('click', function (e) {
//                                     e.preventDefault();
//                                     $('.hystory__details').remove();
//                                 });
//
//                                 // добавляем элементы истории
//                                 const addHistoryItem = function (title, value) {
//                                     var historyItem = `
//                                         <div class="flex__history" style="
//                                             display: flex;
//                                             flex-direction: row;
//                                             background: #fcfcfc;
//                                             border-top: 1px solid #dbdedf;
//                                             border-bottom: 1px solid #dbdedf;
//                                             margin-bottom: 2px;
//                                         ">
//                                             <div class="title" style="width: 30%; text-align: right; padding: 5px 0 5px 5px; color: #92989b;">
//                                                 ${ title }
//                                             </div>
//                                             <div class="value" style=" width: 70%; padding: 5px;">
//                                                 ${ value }
//                                             </div>
//                                         </div>
//                                     `;
//                                     $('.modal__hystory-details').append(historyItem);
//                                 }
//
//                                 addHistoryItem('Дата таймера', this.created_at + 'г.');
//                                 addHistoryItem('Имя клиента:', this.client);
//                                 addHistoryItem('Ответственный:', this.user);
//                                 addHistoryItem('Комментарий:', this.comment);
//                                 addHistoryItem('Ссылка на задачу:', `
//                                     <a href="${ this.link_task }" target="_blank" style="
//                                         text-decoration: none; color: #1375ab; word-break: break-all;
//                                     ">${ this.link_task }</a>
// `                                       );
//                                 addHistoryItem('Цена за работу:', this.price + 'р.');
//                                 addHistoryItem('Оказанная услуга:', this.service);
//
//                                 // кнопки Редактировать, Сохранить
//                                 var editBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
//                                         class_name: 'modal__editBtn-history',
//                                         text: 'Редактировать'
//                                     }),
//                                     saveEditBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
//                                         class_name: 'modal__saveEditBtn-history',
//                                         text: 'Сохранить'
//                                     }),
//                                     editBtnWrapper = '<div class="modal-body__actions" style="width: 100%; text-align: right;"></div>';
//
//                                 $('.modal__hystory-details').append(editBtnWrapper);
//                                 $('.modal__hystory-details .modal-body__actions').append(editBtn);
//                                 $('.modal__hystory-details .modal-body__actions').append(saveEditBtn);
//                                 $('.modal__hystory-details .modal-body__actions').css('margin-top', '10px');
//
//                                 $('.modal__editBtn-history').unbind('click');
//                                 $('.modal__editBtn-history').bind('click', function () {});
//                             });
//                         }
//
//                         // добавляем историю таймеров (дата, ответственный, сумма)
//                         $.each(self.history, function () {
//                             var historyItem = `
//                                 <div class="link-details" data-id="${ this.id }" style="
//                                     display: flex;
//                                     flex-direction: row;
//                                     justify-content: space-between;
//                                     width: calc(100% - 10px);
//                                     border-top: 1px solid #dbdedf;
//                                     border-bottom: 1px solid #dbdedf;
//                                     margin-bottom: 2px;
//                                     background: #fcfcfc;
//                                     padding: 1px 5px;
//                                     cursor: pointer;
//                                     ">
//                                     <div>
//                                         <span style="color: #979797; font-size: 13px;">${ this.created_at }</span><br/>
//                                         ${ this.user }
//                                     </div>
//                                     <div style="display: flex; align-items: center;">${ this.price }р.</div>
//                                 </div>
//                             `;
//                             $('.modal__hystory-deposit__wrapper').append(historyItem);
//                             $('.link-details').unbind('click');
//                             $('.link-details').bind('click', showDetails);
//                             // $('.link-details').bind('click', function (e) {
//                             //     console.log(e.target);
//                             // });
//                         });
//                     }
//
//                     // кнопка Закрыть
//                     $('.modal__hystory-block').css('position', 'relative');
//                     hystoryCancelBtn = `
//                         <a href="#" class="hystory__cancel__btn" style="
//                             text-decoration: none;
//                             color: #92989b;
//                             font-size: 14px;
//                             font-weight: bold;
//                             top: 3px;
//                             right: 0;
//                             position: absolute;
//                         ">Закрыть</a>
//                     `;
//                     $('.modal__hystory-block').append(hystoryCancelBtn);
//                     $('.hystory__cancel__btn').bind('click', function (e) {
//                         e.preventDefault();
//                         $('.hystory__timer').remove();
//                     });
//
//                     // margin-bottom для отступа
//                     $('.modal__hystory-block').append('<div class="modal__bottom" style="position: absolute; height: 30px; width: 100%"></div>');
//                 }
//             });
//         });





//         // перезапуск интервалов
//         const resetIntervals = function () {
//             // останавливаем все таймеры
//             var maxInterval = setInterval(() => {}, 1);
//             for (var i = 0; i < maxInterval; i++) clearInterval(i);
//
//             // берем значения из куки
//             var timerID, timeCoockie, statusCoockie, linkCoockie;
//             readCookie('timer') ? self.timer = JSON.parse(readCookie('timer')) : self.timer = {};
//
//             if (self.timer) {
//                 // перебираем полученный массив
//                 $.each(self.timer, function (key, value) {
//                     // и для каждого запускаем таймер
//                     var interval = setInterval(() => {
//                         timerID = key;
//                         [timeCoockie, statusCoockie, linkCoockie] = self.timer[timerID];
//
//                         // если таймер не запущен, пропускаем
//                         if (statusCoockie !== 'start') return;
//
//                         // устанавливаем время из массива
//                         var date = new Date();
//                         var time = timeCoockie.split(':');
//                         date.setHours(time[0]);
//                         date.setMinutes(time[1]);
//                         date.setSeconds(time[2]);
//
//                         // если прошли сутки, останавливаем таймер (максимальное время)
//                         if (date.getSeconds() === 59 && date.getMinutes() === 59 && date.getHours() === 23) {
//                             clearInterval(interval);
//                             return false;
//                         }
//
//                         // увеличиваем на секунду
//                         date.setSeconds(date.getSeconds() + 1);
//                         timeCoockie = date.toLocaleTimeString();
//                         // обновляем массив
//                         self.timer[timerID] = [timeCoockie, statusCoockie, linkCoockie];
//                         // пишем новое значение в куки
//                         writeCookie('timer', JSON.stringify(self.timer), 30);
//
//                         // если модалка открыта, отображаем текущее значение таймера
//                         var modalTimer = $(`.modal__main-block[data-id="${ timerID }"]`);
//                         if (modalTimer.length) modalTimer.find('.timer').text(timeCoockie);
//                     }, 10);
//                 });
//             }
//         }

        // модалка таймера
        const modalTimer = function () {
            $('.billing__link').bind('click', function (e) {
                e.preventDefault();
                var startInterval,
                    rights = false,
                    priceManager = false,
                    userID = AMOCRM.constant('user').id,
                    essenseID = AMOCRM.data.current_card.id,
                    timezone = AMOCRM.constant('account').timezone;

                // права доступа и стоимость сотрудника из настроек
                self.getConfigSettings();
                if (self.config_settings.rights && self.config_settings.rights[userID]) {
                    rights = self.config_settings.rights[userID];
                }
                if (self.config_settings.priceManager && self.config_settings.priceManager[userID]) {
                    priceManager = self.config_settings.priceManager[userID];
                }
                console.log(priceManager, rights);




                // достаем данные из куки в локальной переменной
                // var timerID, timeCoockie, statusCoockie, linkCoockie;
                // if (self.timer) {
                //     $.each(self.timer, function (key, value) {
                //         if (parseInt(key) !== AMOCRM.data.current_card.id) return;
                //         [timeCoockie, statusCoockie, linkCoockie] = value;
                //         timerID = key;
                //     });
                // }

                // if (!timerID) timerID = AMOCRM.data.current_card.id;
                // if (!timeCoockie) timeCoockie = '00:00:00';
                // if (!statusCoockie) statusCoockie = '';
                // if (!linkCoockie) linkCoockie = '';

                // запуск модалки
                new Modal({
                    class_name: 'timer',
                    init: function ($modal_body) {
                        var $this = $(this);
                        $modal_body
                            .trigger('modal:loaded')
                            .html(`
                                <div class="modal__timer" style="width: 100%; min-height: 235px;">
                                    <h2 class="modal__body__caption head_2">Таймер</h2>
                                </div>
                            `)
                            .trigger('modal:centrify')
                            .append('');
                    },
                    destroy: function () { clearInterval(startInterval) }
                });

                // проверка авторизации для запуска таймера
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: { 'domain': document.domain, 'method': 'isAuth' },
                    dataType: 'html',
                    success: function(data) {
                        if (!data) {
                            $('.hystory__link').css('display', 'none');
                            $('.modal__link__project__wrapper').css('display', 'none');
                            // $('.modal__link-task__wrapper').css('display', 'none');
                            // $('.modal__timer__wrapper').css('display', 'none');
                            $('.modal__timer').append(`
                                <div class="noIsAuth" style="
                                    display: flex; align-items: center; justify-content: center; height: 150px;">
                                    Виджет не авторизован<br/>
                                </div>
                            `);
                        }
                    }
                });

                // история
                $('.modal__timer').css('position', 'relative');
                hystoryLink = `
                    <a href="#" class="hystory__link" style="
                        text-decoration: none;
                        color: #1375ab;
                        top: 5px;
                        right: 0;
                        position: absolute;
                    ">История</a>
                `;
                if (rights && rights.includes('isShowHistory')) $('.modal__timer').append(hystoryLink);

                // ссылка на проект
                var linkProjectWrapper = `<div class="modal__link__project__wrapper" style="width: 100%;">
                    <span style="width: 100%;">Ссылка на проект:</span><br/>
                    <a href="#" class="modal__link__project" style="
                        margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                    </a>
                </div>`;

                var changeLinkProject = `<a href="#" class="change__link__project" style="
                    text-decoration: none; color: #6b6d72;">&nbsp;(изменить)
                </a>`;

                $('.modal__timer').append(linkProjectWrapper);
                $('.modal__link__project').attr('href', $('.modal__link__project').text());
                if (rights && rights.includes('isEditLink')) $('.modal__link__project').after(changeLinkProject);

                // поле ввода изменения ссылки на проект
                var inputLinkProject = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-project',
                    class_name: 'modal__input__link__project',
                    value: '',
                    placeholder: 'вставьте ссылку на проект'
                });

                // редактирование ссылки на проект
                const changeLink = function (e) {
                    e.preventDefault();

                    // меняем ссылку на поле ввода
                    $('.modal__link__project__wrapper').append(inputLinkProject);
                    $('.modal__input__link__project').css({ 'width': '100%', 'margin-top': '3px' }).focus();
                    $('.modal__input__link__project').val($('.modal__link__project').text().trim());
                    $('.modal__link__project').remove();
                    $('.change__link__project').remove();

                    // меняем текст ссылки, удаляем поле ввода и возвращаем ссылку
                    $('.modal__input__link__project').focusout(function (e) {
                        e.preventDefault();

                        // обновляем ссылку в БД
                        $.ajax({
                            url: url_link_t,
                            method: 'post',
                            data: {
                                'domain': document.domain,
                                'method': 'change_link_project',
                                'essence_id': essenseID,
                                'link_project': $('.modal__input__link__project').val().trim()
                            },
                            dataType: 'json',
                            success: function (data) {
                                $('.modal__link__project__wrapper').append(`
                                    <a href="#" class="modal__link__project" style="
                                        margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                                    </a>
                                `);
                                $('.modal__link__project').text(data);
                                $('.modal__link__project').attr('href', data);
                                $('.modal__link__project').after(changeLinkProject);
                                $('.modal__input__link__project').remove();
                                $('.change__link__project').bind('click', changeLink);
                            }
                        });
                    });
                }

                $('.change__link__project').unbind('click');
                $('.change__link__project').bind('click', changeLink);

                // показываем актуальную ссылку на проект
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'link_project',
                        'essence_id': essenseID
                    },
                    dataType: 'json',
                    success: function (data) {
                        $('.modal__link__project').text(data);
                        $('.modal__link__project').attr('href', data);
                    }
                });

                // ссылка на задачу
                var inputLinkTask = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-task',
                    class_name: 'modal__input__link__task',
                    value: '',
                    placeholder: 'вставьте ссылку на задачу'
                });

                var linkTaskWrapper = `<div class="modal__link-task__wrapper" style="width: 100%; margin-top: 10px;">
                    <span style="width: 100%;">Ссылка на задачу:</span><br/>
                    ${ inputLinkTask }
                </div>`;

                $('.modal__timer').append(linkTaskWrapper);
                $('.modal__input__link__task').css({ 'width': '100%', 'margin-top': '3px' });

                // возвращаем актуальный цвет рамки в случае ошибки
                $('.modal__input__link__task').unbind('input');
                $('.modal__input__link__task').bind('input', () => {
                    $('.modal__input__link__task').css('border-color', '#dbdedf');
                });

                // показываем актуальную ссылку на задачу, если таймер был ранее запущен
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'link_task',
                        'essence_id': essenseID,
                        'user_id': userID
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (!data) $('.modal__input__link__task').val('');
                        else {
                            $('.modal__input__link__task').val(data);
                            $('.modal__input__link__task').css('display', 'none');
                            $('.modal__link-task__wrapper').append(`<a href="${ data }" class="modal__link__task" style="
                                    margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                                    ${ data }
                                </a>
                            `);
                        }
                    }
                });

                // таймер
                var startTimerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'start__timer__btn',
                        text: 'Старт',
                    }),
                    pauseTimerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'pause__timer__btn',
                        text: 'Пауза',
                    }),
                    stopTimerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'stop__timer__btn',
                        text: 'Стоп',
                    });

                var timerWrapper = `<div class="modal__timer__wrapper" style="
                        width: 100%; margin-top: 20px; display: flex; flex-direction: row;
                    ">
                    <span style="font-size: 24px; margin-right: 20px;" class="time__timer">00:00:00</span>
                    <div class="btns__timer" style="display: flex; flex-direction: row;">
                        ${ startTimerBtn } ${ pauseTimerBtn } ${ stopTimerBtn }
                    </div>
                </div>`;

                $('.modal__timer').append(timerWrapper);
                $('.start__timer__btn').css({ 'margin-left': '5px', 'margin-top': '-2px', 'width': '80px' });
                $('.pause__timer__btn').css({ 'margin-left': '5px', 'margin-top': '-2px', 'width': '80px' });
                $('.stop__timer__btn').css({ 'margin-left': '5px', 'margin-top': '-2px', 'width': '80px' });









                // отображение таймера
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'timer',
                        'essence_id': essenseID,
                        'user_id': userID,
                        'timezone': timezone
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (!data) console.log('not data');
                        else {
                            console.log(data);

                            // устанавливаем время из массива
                            var date = new Date();
                            var time = data.time_work.split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(time[2]);

                            // отображаем интервал
                            startInterval = setInterval(() => {
                                // если прошли сутки, останавливаем таймер (максимальное время)
                                if (date.getSeconds() === 59 && date.getMinutes() === 59 && date.getHours() === 23) {
                                    clearInterval(interval);
                                    return false;
                                }
                                // увеличиваем на секунду
                                date.setSeconds(date.getSeconds() + 1);
                                // если модалка открыта, отображаем текущее значение таймера
                                $('.modal__timer__wrapper .time__timer').text(date.toLocaleTimeString());
                            }, 1000);
                        }
                    }
                });




                // запуск таймера
                $('.start__timer__btn').unbind('click');
                $('.start__timer__btn').bind('click', function () {
                    // если ссылки на задачу нет, отключаем кнопку
                    if ($('.modal__input__link__task').val().trim().length === 0) {
                        $('.modal__input__link__task').css('border-color', '#f37575');
                        $('.modal__input__link__task').val('').focus();
                        return false;
                    }

                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: {
                            'domain': document.domain,
                            'method': 'timer_start',
                            'essence_id': essenseID,
                            'user_id': userID,
                            'link_task': $('.modal__input__link__task').val().trim(),
                            'timezone': timezone
                        },
                        dataType: 'json',
                        success: function (data) {
                            console.log(data);

                            // устанавливаем время из массива
                            var date = new Date();
                            var time = data.time_work.split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(time[2]);

                            // отображаем интервал
                            startInterval = setInterval(() => {
                                // если прошли сутки, останавливаем таймер (максимальное время)
                                if (date.getSeconds() === 59 && date.getMinutes() === 59 && date.getHours() === 23) {
                                    clearInterval(interval);
                                    return false;
                                }
                                // увеличиваем на секунду
                                date.setSeconds(date.getSeconds() + 1);
                                // если модалка открыта, отображаем текущее значение таймера
                                $('.modal__timer__wrapper .time__timer').text(date.toLocaleTimeString());
                            }, 1000);
                        }
                    });


                    // // убираем кнопку старт и показываем паузу и стоп
                    // $('.pause-timer__btn').css('display', 'block');
                    // $('.start-timer__btn').css('display', 'none');
                    // $('.stop-timer__btn').css('display', 'block');
                    //
                    // // отключаем редактирование ссылки на задачу, и показываем только ссылку
                    // if (!$('.modal__link-task').length) {
                    //     var linkTask = `<a href="${ $('.modal__input__link-task').val() }" class="modal__link-task"
                    //         style="
                    //             margin-top: 3px;
                    //             text-decoration: none;
                    //             color: #1375ab;
                    //             word-break: break-all;
                    //         " target="_blank">
                    //         ${ $('.modal__input__link-task').val() }
                    //     </a>`;
                    //     $('.modal__link-task__wrapper').append(linkTask);
                    //     $('.modal__input__link-task').css('display', 'none');
                    // }
                    //
                    // // запускаем таймер
                    // timeCoockie = $(`.modal__main-block[data-id="${ timerID }"] .timer`).text();
                    // statusCoockie = 'start';
                    // if (!linkCoockie) linkCoockie = input.val();
                    //
                    // self.timer[AMOCRM.data.current_card.id] = [timeCoockie, statusCoockie, linkCoockie];
                    // writeCookie('timer', JSON.stringify(self.timer), 30);
                    // resetIntervals();
                });














                // кнопка Закрыть
                var cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                        class_name: 'modal__cancelBtn__timer',
                        text: 'Закрыть'
                    }),
                    cancelBtnWrapper = `<div class="modal__body__actions" style="width: 100%;">
                        ${ cancelBtn }
                    </div>`;

                $('.modal__timer').append(cancelBtnWrapper);
                $('.modal__body__actions').css('margin-top', '20px');

                // margin-bottom для отступа
                $('.modal__timer').append('<div class="modal__bottom" style="position: absolute; height: 70px; width: 100%"></div>');






//                 /* ############################################################### */
//

//
//                 // если таймер не оставновлен, показываем кнопки пауза и стоп
//                 if (statusCoockie == 'start') {
//                     $('.start-timer__btn').css('display', 'none');
//                     $('.pause-timer__btn').css('display', 'block');
//                     $('.stop-timer__btn').css('display', 'block');
//                 }
//
//                 // если таймер на паузе, показываем кнопки старт и стоп
//                 if (statusCoockie == 'pause' || !statusCoockie) {
//                     $('.pause-timer__btn').css('display', 'none');
//                     $('.start-timer__btn').css('display', 'block');
//                     $('.stop-timer__btn').css('display', 'block');
//                 }
//
//                 // если таймер оставновлен, прячем кнопки старт и пауза
//                 if (statusCoockie == 'stop') {
//                     $('.pause-timer__btn').css('display', 'none');
//                     $('.start-timer__btn').css('display', 'none');
//                     $('.stop-timer__btn').css('display', 'block');
//                 }
//
//                 // восстанавливаем цвет ссылки задачи в случае ошибки
//                 var input = $('.modal__input__link-task');
//                 input.unbind('change');
//                 input.bind('change', () => { input.css('border-color', '#dbdedf') });
//
//                 /* ################## */
//

//
//                 /* ################## */
//
//                 // запуск таймера
//                 $('.start-timer__btn').unbind('click');
//                 $('.start-timer__btn').bind('click', function () {
//                     // если ссылки на задачу нет, отключаем кнопку
//                     if (input.length) {
//                         if (input.val().trim().length === 0) {
//                             input.css('border-color', '#f37575 ');
//                             input.val('');
//                             input.focus();
//                             return false;
//                         }
//                     }
//
//                     // убираем кнопку старт и показываем паузу и стоп
//                     $('.pause-timer__btn').css('display', 'block');
//                     $('.start-timer__btn').css('display', 'none');
//                     $('.stop-timer__btn').css('display', 'block');
//
//                     // отключаем редактирование ссылки на задачу, и показываем только ссылку
//                     if (!$('.modal__link-task').length) {
//                         var linkTask = `<a href="${ $('.modal__input__link-task').val() }" class="modal__link-task"
//                             style="
//                                 margin-top: 3px;
//                                 text-decoration: none;
//                                 color: #1375ab;
//                                 word-break: break-all;
//                             " target="_blank">
//                             ${ $('.modal__input__link-task').val() }
//                         </a>`;
//                         $('.modal__link-task__wrapper').append(linkTask);
//                         $('.modal__input__link-task').css('display', 'none');
//                     }
//
//                     // запускаем таймер
//                     timeCoockie = $(`.modal__main-block[data-id="${ timerID }"] .timer`).text();
//                     statusCoockie = 'start';
//                     if (!linkCoockie) linkCoockie = input.val();
//
//                     self.timer[AMOCRM.data.current_card.id] = [timeCoockie, statusCoockie, linkCoockie];
//                     writeCookie('timer', JSON.stringify(self.timer), 30);
//                     resetIntervals();
//                 });
//
//                 // пауза таймера
//                 $('.pause-timer__btn').unbind('click');
//                 $('.pause-timer__btn').bind('click', function () {
//                     // убираем кнопку пауза и показываем старт и стоп
//                     $('.pause-timer__btn').css('display', 'none');
//                     $('.start-timer__btn').css('display', 'block');
//                     $('.stop-timer__btn').css('display', 'block');
//
//                     // останавливаем таймер
//                     timeCoockie = $(`.modal__main-block[data-id="${ timerID }"] .timer`).text();
//                     statusCoockie = 'pause';
//
//                     self.timer[AMOCRM.data.current_card.id] = [timeCoockie, statusCoockie, linkCoockie];
//                     writeCookie('timer', JSON.stringify(self.timer), 30);
//                     resetIntervals();
//                 });
//
//                 // стоп таймера
//                 $('.stop-timer__btn').unbind('click');
//                 $('.stop-timer__btn').bind('click', function () {
//                     // если таймер не был запущен, пропускаем
//                     if (!linkCoockie) return;
//
//                     // убираем кнопку пауза и показываем старт и стоп
//                     $('.pause-timer__btn').css('display', 'none');
//                     $('.start-timer__btn').css('display', 'none');
//                     $('.stop-timer__btn').css('display', 'block');
//
//                     // останавливаем таймер
//                     timeCoockie = $(`.modal__main-block[data-id="${ timerID }"] .timer`).text();
//                     statusCoockie = 'stop';
//
//                     self.timer[AMOCRM.data.current_card.id] = [timeCoockie, statusCoockie, linkCoockie];
//                     writeCookie('timer', JSON.stringify(self.timer), 30);
//                     resetIntervals();
//
//                     // запуск модалки завершения таймера
//                     new Modal({
//                         class_name: 'stop__timer',
//                         init: function ($modal_body) {
//                             var $this = $(this);
//                             $modal_body
//                                 .trigger('modal:loaded')
//                                 .html(`
//                                     <div class="modal__main-block-stop" style="width: 100%; min-height: 360px;">
//                                         <h2 class="modal-body__caption head_2">Сохранение таймера</h2>
//                                     </div>
//                                 `)
//                                 .trigger('modal:centrify')
//                                 .append('');
//                         },
//                         destroy: function () {}
//                     });
//
//                     // выбор ответственного
//                     var managers = [];
//                     managers.push({ id: 'null', option: 'Выберите ответственного' });
//
//                     $.each(AMOCRM.constant('managers'), function () {
//                         if (!this.active) return;
//                         managers.push({ id: this.id, option: this.title });
//                     });
//
//                     var selectManagers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
//                             items: managers,
//                             class_name: 'modal__select-managers'
//                         }),
//                         selectManagersWrapper = '<div class="modal__select-managers__wrapper" style="width: 100%; margin-top: 20px;"></div>';
//
//                     $('.modal__main-block-stop').append(selectManagersWrapper);
//                     $('.modal__select-managers__wrapper').append(selectManagers);
//                     $('.modal__select-managers .control--select--button').css('width', '100%');
//                     $('.modal__select-managers ul').css({
//                         'margin-left': '13px',
//                         'width': 'auto',
//                         'min-width': $('.modal__main-block-stop').outerWidth() - 13
//                     });
//
//                     // имя клиента
//                     var inputClientName = Twig({ ref: '/tmpl/controls/input.twig' }).render({
//                         name: 'modal-input-client-name',
//                         class_name: 'modal__input__client-name',
//                         value: '',
//                         placeholder: 'введите имя клиента'
//                     });
//
//                     var inputClientNameWrapper = `<div class="modal__client-name__wrapper" style="width: 100%; margin-top: 10px;">
//                         <span style="width: 100%;">Имя клиента:</span><br/>
//                     </div>`;
//
//                     $('.modal__main-block-stop').append(inputClientNameWrapper);
//                     $('.modal__client-name__wrapper').append(inputClientName);
//                     $('.modal__input__client-name').css({ 'width': '100%', 'margin-top': '3px' });
//
//                     // выбор услуги
//                     var services = [];
//                     services.push({ id: 'null', option: 'Выберите оказанную услугу' });
//                     services.push({ id: '1', option: 'Работа в amoCRM' });
//                     services.push({ id: '2', option: 'Консультация в чате' });
//                     services.push({ id: '3', option: 'Выберите оказанную услугу' });
//                     services.push({ id: '4', option: 'Выберите оказанную услугу' });
//                     services.push({ id: '5', option: 'Выберите оказанную услугу' });
//                     services.push({ id: '6', option: 'Выберите оказанную услугу' });
//                     services.push({ id: '7', option: 'Выберите оказанную услугу' });
//
//                     var selectServices = Twig({ ref: '/tmpl/controls/select.twig' }).render({
//                             items: services,
//                             class_name: 'modal__select-services'
//                         }),
//                         selectServicesWrapper = '<div class="modal__select-services__wrapper" style="width: 100%; margin-top: 20px;"></div>';
//
//                     $('.modal__main-block-stop').append(selectServicesWrapper);
//                     $('.modal__select-services__wrapper').append(selectServices);
//                     $('.modal__select-services .control--select--button').css('width', '100%');
//                     $('.modal__select-services ul').css({
//                         'margin-left': '13px',
//                         'width': 'auto',
//                         'min-width': $('.modal__main-block').outerWidth() - 13
//                     });
//
//                     // комментарий
//                     var textareaComment = Twig({ ref: '/tmpl/controls/textarea.twig' }).render({
//                         name: 'modal-textarea-comment',
//                         class_name: 'modal__textarea__comment',
//                         placeholder: 'введите комментарий'
//                     });
//
//                     var textareaCommentWrapper = `<div class="modal__textarea-comment__wrapper" style="width: 100%; margin-top: 10px;">
//                         <span style="width: 100%;">Комментарий:</span><br/>
//                     </div>`;
//
//                     $('.modal__main-block-stop').append(textareaCommentWrapper);
//                     $('.modal__textarea-comment__wrapper').append(textareaComment);
//                     $('.modal__textarea__comment').css({ 'width': '100%', 'margin-top': '3px' });
//
//                     // кнопки Сохранить и Закрыть
//                     var saveBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
//                             class_name: 'modal__saveBtn-timer',
//                             text: 'Сохранить'
//                         }),
//                         cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
//                             class_name: 'modal__cancelBtn-timer',
//                             text: 'Закрыть'
//                         }),
//                         btnWrapper = '<div class="modal-body__actions-stop" style="width: 100%;"></div>';
//
//                     $('.modal__main-block-stop').append(btnWrapper);
//                     $('.modal-body__actions-stop').append(saveBtn);
//                     $('.modal-body__actions-stop').append(cancelBtn);
//                     $('.modal-body__actions-stop').css('margin-top', '20px');
//
//                     // margin-bottom для отступа
//                     $('.modal__main-block-stop').append(`
//                         <div class="modal__bottom" style="position: absolute; height: 70px; width: 100%"></div>
//                     `);
//
//                     // сохранение таймера в БД
//                     $('.modal__saveBtn-timer').unbind('click');
//                     $('.modal__saveBtn-timer').bind('click', function () {
//                         var manager = $('.modal__select-managers .control--select--button');
//                         var client = $('.modal__input__client-name');
//                         var service = $('.modal__select-services .control--select--button');
//                         var comment = $('.modal__textarea__comment');
//                         var error = false;
//
//                         // если необходимые поля не выбраны, красим в красный
//                         if (manager.text() === 'Выберите ответственного') {
//                             manager.css('border-color', '#f57d7d');
//                             error = true;
//                         }
//                         if (!client.val().trim().length) {
//                             client.css('border-color', '#f57d7d');
//                             client.val(client.val().trim());
//                             error = true;
//                         }
//                         if (service.text() === 'Выберите оказанную услугу') {
//                             service.css('border-color', '#f57d7d');
//                             error = true;
//                         }
//
//                         // возвращаем естесственные цвета в случае изменения
//                         manager.unbind('click');
//                         manager.bind('click', function () { manager.css('border-color', '#d4d5d8') });
//                         client.unbind('change');
//                         client.bind('change', function () { client.css('border-color', '#d4d5d8') });
//                         service.unbind('click');
//                         service.bind('click', function () { service.css('border-color', '#d4d5d8') });
//
//                         if (error) return;
//
//                         var price = 0;
//                         var time = timeCoockie.split(':');
//                         if (parseInt(time[0]) > 0) {
//                             price = (parseInt(time[0]) * 60) + parseInt(time[1]);
//                         } else price = parseInt(time[1]);
//
//                         var _data = {};
//                         _data['domain'] = document.domain;
//                         _data['method'] = 'save_timer';
//                         _data['essence_id'] = timerID;
//                         _data['user'] = manager.text();
//                         _data['client'] = client.val();
//                         _data['service'] = service.text();
//                         _data['comment'] = comment.val().trim();
//                         _data['price'] = price;
//                         _data['link_task'] = linkCoockie;
//
//                         $.ajax({
//                             url: url_link_t,
//                             method: 'post',
//                             data: _data,
//                             dataType: 'json',
//                             success: function (data) {}
//                         });
//
//                         // обнуляем таймер
//                         var resetTimer = {};
//                         $.each(self.timer, function (key, value) {
//                             if (parseInt(key) === AMOCRM.data.current_card.id) return;
//                             resetTimer[key] = value;
//                         });
//                         self.timer = resetTimer;
//                         writeCookie('timer', JSON.stringify(self.timer), 30);
//                         resetIntervals();
//
//                         $('.stop__timer').remove();
//
//                         timeCoockie = '00:00:00';
//                         statusCoockie = '';
//                         linkCoockie = '';
//
//                         $('.modal__link-task').remove();
//                         $('.modal__input__link-task').css('display', 'block');
//                         $('.modal__input__link-task').val('');
//                         $(`.modal__main-block[data-id="${ timerID }"] .timer`).text(timeCoockie);
//                         $('.pause-timer__btn').css('display', 'none');
//                         $('.start-timer__btn').css('display', 'block');
//                         $('.stop-timer__btn').css('display', 'block');
//                     });
//                 });
//
//
//
//
//
//
//
//
//
//
//
//
//
//                 /* ############################################################### */
//
//                 // запуск истории
//                 $('.hystory__link').unbind('click');
//                 $('.hystory__link').bind('click', function (e) {
//                     e.preventDefault();
//
//                     // получаем данные
//                     var _data = {};
//                     _data['domain'] = document.domain;
//                     _data['method'] = 'hystory';
//                     _data['essence_id'] = AMOCRM.data.current_card.id;
//                     $.ajax({
//                         url: url_link_t,
//                         method: 'post',
//                         data: _data,
//                         dataType: 'json',
//                         success: function(data) {
//                             var deposit = 0;
//                             self.history = null;
//                             self.history = data.history;
//                             if (data.deposit) deposit = data.deposit;
//
//                             new Modal({
//                                 class_name: 'hystory__timer',
//                                 init: function ($modal_body) {
//                                     var $this = $(this);
//                                     $modal_body
//                                         .trigger('modal:loaded')
//                                         .html(`
//                                             <div class="modal__hystory-block" style="width: 100%; height: 600px;">
//                                                 <h2 class="modal-body__caption head_2">История</h2>
//                                             </div>
//                                         `)
//                                         .trigger('modal:centrify')
//                                         .append('');
//                                 },
//                                 destroy: function () {}
//                             });
//                             $('.hystory__timer .modal-body').css('overflow', 'auto');
//
//                             // депозит
//                             var inputHystoryDeposit = Twig({ ref: '/tmpl/controls/input.twig' }).render({
//                                 name: 'modal-input-hystory-deposit',
//                                 class_name: 'modal__input__hystory-deposit',
//                                 value: deposit,
//                                 placeholder: 'укажите сумму депозита'
//                             });
//
//                             var HystoryDepositWrapper = `<div class="modal__hystory-deposit__wrapper" style="width: 100%; margin-top: 20px;">
//                                 <span >Сумма депозита:</span>
//                             </div>`;
//
//                             $('.modal__hystory-block').append(HystoryDepositWrapper);
//                             $('.modal__hystory-deposit__wrapper').append(inputHystoryDeposit);
//                             $('.modal__input__hystory-deposit').css('margin-bottom', '10px');
//
//                             // редактирование депозита
//                             var deposit = $('.modal__input__hystory-deposit');
//                             deposit.bind('input', () => deposit.css('border-color', '#dbdedf'));
//
//                             deposit.unbind('change');
//                             deposit.bind('change', function () {
//                                 var _data = {};
//                                 _data['domain'] = document.domain;
//                                 _data['method'] = 'change_deposit';
//                                 _data['essence_id'] = AMOCRM.data.current_card.id;
//                                 _data['deposit'] = deposit.val().trim();
//                                 $.ajax({
//                                     url: url_link_t,
//                                     method: 'post',
//                                     data: _data,
//                                     dataType: 'json',
//                                     success: function (data) {
//                                         // обновляем значение депозита
//                                         deposit.val(data);
//
//                                         // красим поле в зеленый цвет
//                                         deposit.css({ 'transition-duration': '0s', 'border-color': '#2bd153' });
//                                         setTimeout(() => {
//                                             deposit.css({
//                                                 'transition-duration': '1s',
//                                                 'border-color': '#dbdedf'
//                                             });
//                                         }, 1000);
//                                     }
//                                 });
//                             });
//
//                             if (self.history) {
//                                 // клик по конкретной истории таймера для детального просмотра
//                                 const showDetails = function (e) {
//                                     var historyID = $(e.target).attr('data-id');
//                                     if (!historyID) historyID = $(e.target).closest('.link-details').attr('data-id');
//
//                                     $.each(self.history, function () {
//                                         if (this.id !== historyID) return;
//                                         console.log(this);
//
//                                         new Modal({
//                                             class_name: 'hystory__details',
//                                             init: function ($modal_body) {
//                                                 var $this = $(this);
//                                                 $modal_body
//                                                     .trigger('modal:loaded')
//                                                     .html(`
//                                                         <div class="modal__hystory-details" style="width: 100%; min-height: 400px;">
//                                                             <h2 class="modal-body__caption head_2">Детализация</h2>
//                                                         </div>
//                                                     `)
//                                                     .trigger('modal:centrify')
//                                                     .append('');
//                                             },
//                                             destroy: function () {}
//                                         });
//
//                                         // кнопка Закрыть
//                                         $('.modal__hystory-details').css('position', 'relative');
//                                         detailsCancelBtn = `
//                                             <a href="#" class="details__cancel__btn" style="
//                                                 text-decoration: none;
//                                                 color: #92989b;
//                                                 font-size: 14px;
//                                                 font-weight: bold;
//                                                 top: 3px;
//                                                 right: 0;
//                                                 position: absolute;
//                                             ">Закрыть</a>
//                                         `;
//                                         $('.modal__hystory-details').append(detailsCancelBtn);
//                                         $('.details__cancel__btn').bind('click', function (e) {
//                                             e.preventDefault();
//                                             $('.hystory__details').remove();
//                                         });
//
//                                         // добавляем элементы истории
//                                         const addHistoryItem = function (title, value) {
//                                             var historyItem = `
//                                                 <div class="flex__history" style="
//                                                     display: flex;
//                                                     flex-direction: row;
//                                                     background: #fcfcfc;
//                                                     border-top: 1px solid #dbdedf;
//                                                     border-bottom: 1px solid #dbdedf;
//                                                     margin-bottom: 2px;
//                                                 ">
//                                                     <div class="title" style="width: 30%; text-align: right; padding: 5px 0 5px 5px; color: #92989b;">
//                                                         ${ title }
//                                                     </div>
//                                                     <div class="value" style=" width: 70%; padding: 5px;">
//                                                         ${ value }
//                                                     </div>
//                                                 </div>
//                                             `;
//                                             $('.modal__hystory-details').append(historyItem);
//                                         }
//
//                                         addHistoryItem('Дата таймера', this.created_at + 'г.');
//                                         addHistoryItem('Имя клиента:', this.client);
//                                         addHistoryItem('Ответственный:', this.user);
//                                         addHistoryItem('Комментарий:', this.comment);
//                                         addHistoryItem('Ссылка на задачу:', `
//                                             <a href="${ this.link_task }" target="_blank" style="
//                                                 text-decoration: none; color: #1375ab; word-break: break-all;
//                                             ">${ this.link_task }</a>
// `                                       );
//                                         addHistoryItem('Цена за работу:', this.price + 'р.');
//                                         addHistoryItem('Оказанная услуга:', this.service);
//
//                                         // кнопки Редактировать, Сохранить
//                                         var editBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
//                                                 class_name: 'modal__editBtn-history',
//                                                 text: 'Редактировать'
//                                             }),
//                                             saveEditBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
//                                                 class_name: 'modal__saveEditBtn-history',
//                                                 text: 'Сохранить'
//                                             }),
//                                             editBtnWrapper = '<div class="modal-body__actions" style="width: 100%; text-align: right;"></div>';
//
//                                         $('.modal__hystory-details').append(editBtnWrapper);
//                                         $('.modal__hystory-details .modal-body__actions').append(editBtn);
//                                         $('.modal__hystory-details .modal-body__actions').append(saveEditBtn);
//                                         $('.modal__hystory-details .modal-body__actions').css('margin-top', '10px');
//
//                                         $('.modal__editBtn-history').unbind('click');
//                                         $('.modal__editBtn-history').bind('click', function () {});
//                                     });
//                                 }
//
//                                 // добавляем историю таймеров (дата, ответственный, сумма)
//                                 $.each(self.history, function () {
//                                     var historyItem = `
//                                         <div class="link-details" data-id="${ this.id }" style="
//                                             display: flex;
//                                             flex-direction: row;
//                                             justify-content: space-between;
//                                             width: calc(100% - 10px);
//                                             border-top: 1px solid #dbdedf;
//                                             border-bottom: 1px solid #dbdedf;
//                                             margin-bottom: 2px;
//                                             background: #fcfcfc;
//                                             padding: 1px 5px;
//                                             cursor: pointer;
//                                             ">
//                                             <div>
//                                                 <span style="color: #979797; font-size: 13px;">${ this.created_at }</span><br/>
//                                                 ${ this.user }
//                                             </div>
//                                             <div style="display: flex; align-items: center;">${ this.price }р.</div>
//                                         </div>
//                                     `;
//                                     $('.modal__hystory-deposit__wrapper').append(historyItem);
//                                     $('.link-details').unbind('click');
//                                     $('.link-details').bind('click', showDetails);
//                                     // $('.link-details').bind('click', function (e) {
//                                     //     console.log(e.target);
//                                     // });
//                                 });
//                             }
//
//                             // кнопка Закрыть
//                             $('.modal__hystory-block').css('position', 'relative');
//                             hystoryCancelBtn = `
//                                 <a href="#" class="hystory__cancel__btn" style="
//                                     text-decoration: none;
//                                     color: #92989b;
//                                     font-size: 14px;
//                                     font-weight: bold;
//                                     top: 3px;
//                                     right: 0;
//                                     position: absolute;
//                                 ">Закрыть</a>
//                             `;
//                             $('.modal__hystory-block').append(hystoryCancelBtn);
//                             $('.hystory__cancel__btn').bind('click', function (e) {
//                                 e.preventDefault();
//                                 $('.hystory__timer').remove();
//                             });
//
//                             // margin-bottom для отступа
//                             $('.modal__hystory-block').append('<div class="modal__bottom" style="position: absolute; height: 30px; width: 100%"></div>');
//                         }
//                     });
//                 });







                /* ############################################################### */


            });
        }








        /* ####################################################################################### */

        // настройка прав доступа
        this.accessRight = function () {
            self.getConfigSettings();

            // выбор оказанных услуги
            // const addSelectServices = function () {
            //     var services = [];
            //     services.push({ option: 'Выберите оказанную услугу' });
            //     if (self.config_settings.services) {
            //         $.each(self.config_settings.services, function () {
            //             services.push({ option: this });
            //         });
            //     }
            //
            //     var selectServices = Twig({ ref: '/tmpl/controls/select.twig' }).render({
            //         items: services,
            //         class_name: 'select__services'
            //     });
            //
            //     return selectServices;
            // }
            //
            // var selectServices = addSelectServices(),
            //     editBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
            //         class_name: 'editBtn__services',
            //         text: 'Редактировать'
            //     });
            //
            // var selectServicesWrapper = `
            //     <div class="widget_settings_block__item_field select__services__wrapper" style="margin-top: 10px;">
            //         <div class="widget_settings_block__title_field" title="" style="margin-bottom: 3px;">
            //             Список выбора оказанных услуг:
            //         </div>
            //         <div class="widget_settings_block__input_field" style="display: flex; flex-direction: row;">
            //             <div class="select" style="width: 75%;">${ selectServices }</div>
            //             <div class="buttonEdit" style="width: 25%; text-align: right;">${ editBtn }</div>
            //         </div>
            //     </div>
            // `;
            //
            // $('.widget_settings_block__controls').before(selectServicesWrapper);
            // $('.select__services__wrapper .select ul').css({
            //     'margin-left': '13px',
            //     'width': 'auto',
            //     'min-width': $('.select__services__wrapper .select').outerWidth() - 13
            // });
            //
            // $('.editBtn__services').unbind('click');
            // $('.editBtn__services').bind('click', function () {
            //     new Modal({
            //         class_name: 'edit__services',
            //         init: function ($modal_body) {
            //             var $this = $(this);
            //             $modal_body
            //                 .trigger('modal:loaded')
            //                 .html(`
            //                     <div class="modal__edit__services" style="width: 100%; min-height: 450px;">
            //                         <h2 class="modal-body__caption head_2">Редактирование оказанных услуг</h2>
            //                     </div>
            //                 `)
            //                 .trigger('modal:centrify')
            //                 .append('');
            //         },
            //         destroy: function () {}
            //     });
            //
            //     // add link service
            //     linkAddService = `
            //         <a href="" class="modal__link__add__service" style="
            //             text-decoration: none;
            //             color: #1375ab;
            //             margin-top: 10px;
            //         ">Добавить</a>
            //     `;
            //     $('.modal__edit__services').append(linkAddService);
            //
            //     // add input
            //     const addInput = function (option = '') {
            //         var input = Twig({ ref: '/tmpl/controls/input.twig' }).render({
            //             name: 'modal-input-edit-service',
            //             class_name: 'modal_input__edit__service',
            //             value: option,
            //             placeholder: 'Вариант',
            //             max_length: 50
            //         });
            //
            //         // вставляем и ровняем инпут и кнопку удаления
            //         $('.modal__link__add__service').before(`
            //             <div class="widget_settings_block__input_field select__enums__item" style="
            //                 margin-bottom: 4px;
            //                 width: 100%;
            //                 position: relative;
            //             ">
            //                 <div class="cf-field-enum__remove" title="Удалить" style="width: auto;">
            //                     <svg class="svg-icon svg-common--trash-dims"><use xlink:href="#common--trash"></use></svg>
            //                 </div>
            //                 ${ input }
            //             </div>
            //         `);
            //
            //         $('.modal_input__edit__service').css({ 'padding-right': '25px', 'width': '100%' });
            //         $('.cf-field-enum__remove').css({
            //             'position': 'absolute',
            //             'top': '10px',
            //             'left': $('.modal_input__edit__service').outerWidth() - 20,
            //             'cursor': 'pointer'
            //         });
            //
            //         // удаление инпута
            //         $('.cf-field-enum__remove').unbind('click');
            //         $('.cf-field-enum__remove').bind('click', function (e) {
            //             $(e.target).closest('.select__enums__item').remove();
            //         });
            //     }
            //
            //     // выводим ранее сохраненные варианты
            //     if (self.config_settings.services) {
            //         $.each(self.config_settings.services, function () { addInput(this) });
            //     }
            //     $('.modal__link__add__service').before(addInput());
            //
            //     // добавление инпута
            //     $('.modal__link__add__service').unbind('click');
            //     $('.modal__link__add__service').bind('click', function (e) {
            //         e.preventDefault();
            //         if (!$('.modal_input__edit__service').length) addInput();
            //         else {
            //             var isEmptyInput = false;
            //             $.each($('.modal_input__edit__service'), function () {
            //                 if (!$(this).val().trim().length) {
            //                     $(this).val('').focus();
            //                     isEmptyInput = true;
            //                     return false;
            //                 }
            //             });
            //             if (!isEmptyInput) addInput();
            //         }
            //     });
            //
            //     // кнопки Сохранить и Закрыть
            //     var saveBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
            //             class_name: 'modal__saveBtn-services',
            //             text: 'Сохранить'
            //         }),
            //         cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
            //             class_name: 'modal__cancelBtn-services',
            //             text: 'Закрыть'
            //         }),
            //         btnWrapper = '<div class="modal-body__actions" style="width: 100%;"></div>';
            //
            //     $('.modal__edit__services').append(btnWrapper);
            //     $('.modal-body__actions').append(saveBtn);
            //     $('.modal-body__actions').append(cancelBtn);
            //     $('.modal-body__actions').css('margin-top', '20px');
            //
            //     $('.modal__saveBtn-services').unbind('click');
            //     $('.modal__saveBtn-services').bind('click', function () {
            //         var services = [];
            //         $.each($('.modal_input__edit__service'), function () {
            //             if (!$(this).val().trim().length) return;
            //             services.push($(this).val().trim());
            //         });
            //         self.config_settings['services'] = services;
            //         self.saveConfigSettings();
            //         $('.edit__services').remove();
            //
            //         // пересобираем селект
            //         $('.select__services__wrapper .select .select__services').remove();
            //         selectServices = addSelectServices()
            //         $('.select__services__wrapper .select').append(selectServices);
            //     });
            //
            //     // margin-bottom для отступа
            //     $('.modal__edit__services').append('<div class="modal__bottom" style="position: absolute; height: 70px; width: 100%;"></div>');
            // });




            // список активных пользователей
            var managers = [], checkbox;
            managers.push({ option: 'Выберите пользователя' });
            $.each(AMOCRM.constant('managers'), function () {
                if (!this.active) return;
                managers.push({ id: this.id, option: this.title });
            });

            // селект с пользователями
            var selectManagers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                items: managers,
                class_name: 'select__managers'
            });
            var selectManagersWrapper = `
                <div class="widget_settings_block__item_field select__managers__wrapper" style="margin-top: 10px;">
                    <div class="widget_settings_block__title_field" title="" style="margin-bottom: 3px;">
                        Настройка прав пользователей:
                    </div>
                    <div class="widget_settings_block__input_field" style="width: 100%;">
                        ${ selectManagers }
                    </div>
                </div> 
            `;

            $('.widget_settings_block__controls').before(selectManagersWrapper);
            $('.select__managers__wrapper .control--select--button').css('width', '100%');
            $('.select__managers__wrapper ul').css({
                'margin-left': '13px',
                'width': '100%',
                'min-width': $('.select__managers__wrapper').outerWidth() - 13
            });

            // выбор пользователя
            $('.select__managers__wrapper ul li').unbind('click');
            $('.select__managers__wrapper ul li').bind('click', function () {
                var managerID = $(this).attr('data-value');

                // очищаем перед запуском чекбоксы
                $('.modal__rights__checkox__wrapper').remove();
                $('.input__price__wrapper').remove();
                if ($(this).find('span').text() === 'Выберите пользователя') {
                    $('.modal__rights__checkox__wrapper').remove();
                    $('.input__price__wrapper').remove();
                    return;
                }

                // стоимость сотрудника
                var inputPrice = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-price',
                    class_name: 'input__price',
                    value: '0',
                    placeholder: 'введите стоимость сотрудника',
                    max_length: 50
                });

                // вставляем и ровняем инпут type=number
                $('.widget_settings_block__controls').before(`
                    <div class="widget_settings_block__item_field input__price__wrapper" style="margin-top: 10px; width: 100%;">
                        <div class="widget_settings_block__title_field" title="">
                            Стоимость сотрудника в минуту (р.):
                        </div>
                    <div class="widget_settings_block__input_field" style="width: 100%;">${ inputPrice }</div>
                    </div>
                `);
                $('.input__price').attr('type', 'number');
                $('.input__price').css('width', '100%');

                $('.input__price').unbind('change');
                $('.input__price').bind('change', function () {
                    var priceManager = parseInt($(this).val()) || 0;

                    if (!self.config_settings.priceManager) self.config_settings.priceManager = {};
                    self.config_settings.priceManager[managerID] = priceManager;
                    self.saveConfigSettings();
                    $(this).val(priceManager);
                });

                // ддобавление чекбокса
                const addCheckbox = function (value, dataValue) {
                    checkbox = Twig({ ref: '/tmpl/controls/checkbox.twig' }).render({
                        class_name: 'modal__rights__checkox',
                        checked: false,
                        value: value,
                        input_class_name: 'modal__rights__checkox__item',
                        name: 'modal-rights--checkox',
                        text: value,
                        dataValue: dataValue
                    });

                    return checkbox;
                }

                checkboxWrapper = '<div class="modal__rights__checkox__wrapper" style="width: 100%; margin-top: 10px;"></div>';
                $('.widget_settings_block__controls').before(checkboxWrapper);

                // ссылка в сущности
                var isEditLink = addCheckbox('Редактирование ссылки в сущности', 'isEditLink');
                $('.modal__rights__checkox__wrapper').append(isEditLink);
                // список в форме на выбор услуги
                var isEditServices = addCheckbox('Редактирование списка в форме на выбор услуги', 'isEditServices');
                $('.modal__rights__checkox__wrapper').append(isEditServices);
                // смотреть историю выполненных задач в сущности
                var isShowHistory = addCheckbox('Просмотр истории выполненных задач в сущности', 'isShowHistory');
                $('.modal__rights__checkox__wrapper').append(isShowHistory);
                // редактирование истории
                var isEditHistory = addCheckbox('Редактирование истории', 'isEditHistory');
                $('.modal__rights__checkox__wrapper').append(isEditHistory);
                // редактирование депозита
                var isEditDeposit = addCheckbox('Редактирование депозита', 'isEditDeposit');
                $('.modal__rights__checkox__wrapper').append(isEditDeposit);
                // выравниваем чекбоксы
                $('.modal__rights__checkox').css({ 'width': '100%', 'margin-top': '3px' });

                // если ранее были отмечены, отображаем
                if (self.config_settings.rights) {
                    $.each(self.config_settings.rights, function (key, value) {
                        if (key !== managerID) return;
                        var rights = self.config_settings.rights[managerID];

                        $.each($('.modal__rights__checkox'), function () {
                            var value = $(this).find('.modal__rights__checkox__item').attr('data-value');
                            if (rights.includes(value)) {
                                $(this).addClass('is-checked');
                                $(this).trigger('click');
                            }
                        });
                    });
                }

                if (self.config_settings.priceManager) {
                    $.each(self.config_settings.priceManager, function (key, value) {
                        if (key !== managerID) return;
                        $('.input__price').val(value);
                    });
                }

                // обновляем права пользователя
                $('.modal__rights__checkox').unbind('change');
                $('.modal__rights__checkox').bind('change', function () {
                    // если ранее не был отмечен, создаем
                    if (!self.config_settings.rights) self.config_settings.rights = {};
                    var rights = [];

                    // обновляем список выбранных вариантов
                    $.each($('.modal__rights__checkox'), function () {
                        var value = $(this).find('.modal__rights__checkox__item').attr('data-value');
                        if ($(this).hasClass('is-checked')) rights.push(value);
                    });

                    self.config_settings.rights[managerID] = rights;
                    self.saveConfigSettings();
                });
            });
        }

        /* ####################################################################################### */

        this.callbacks = {
            settings: function() {
                self.accessRight();
                self.saveConfigSettings();

                // Блок первичных настроек и авторизации
                var _settings = self.get_settings();
                var data = '<div id="settings_WidgetBilling">Загружается...</div>';
                $('[id="settings_WidgetBilling"]').remove();
                $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                var _secret = $('p.js-secret').attr('title');
                var _data = {};
                _data["domain"] = document.domain;
                _data["settings"] = _settings;
                _data["secret"] = _secret;
                _data["method"] = "settings";
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: _data,
                    dataType: 'html',
                    success: function(data) {
                        $('[id="settings_WidgetBilling"]').remove();
                        $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                    }
                });
            },
            init: function() {
                return true;
            },
            bind_actions: function() {
                return true;
            },
            render: function() {
                // в случае обновления страницы запускаем таймеры для продолжения
                // resetIntervals();

                // ссылка на запуск таймера
                if ((AMOCRM.getBaseEntity() === 'customers' || AMOCRM.getBaseEntity() === 'leads')
                    && AMOCRM.isCard()) {

                    self.render_template({
                        body: '',
                        caption: { class_name: 'widget__billing' },
                        render: `<a href="#" class="billing__link" style="
                            font-size: 16px;
                            text-decoration: none;
                            color: #1375ab;
                            margin-left: 12px;
                            margin-top: 10px;
                        ">Открыть таймер</a>`
                    });

                    // запускаем модалку с таймером
                    modalTimer();
                }

                return true;
            },
            contacts: {
                selected: function () {}
            },
            companies: {
                selected: function () {},
            },
            leads: {
                selected: function () {}
            },
            tasks: {
                selected: function() {}
            },
            destroy: function() {},
            onSave: function() {
                var _settings = self.get_settings();
                var data = '<div id="settings_WidgetBilling">Загружается...</div>';
                $('[id="settings_WidgetBilling"]').remove();
                $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                var _secret = $('p.js-secret').attr('title');
                var _data = {};
                _data["domain"] = document.domain;
                _data["settings"] = _settings;
                _data["settings"]["active"] = "Y";
                _data["secret"] = _secret;
                _data["method"] = "settings";
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: _data,
                    dataType: 'html',
                    success: function(data) {
                        $('[id="settings_WidgetBilling"]').remove();
                        $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                    }
                });

                return true;
            },
            advancedSettings: function() {}
        };
        return this;
    };
    return CustomWidget_WidgetBilling;
});

// https://integratorgroup.k-on.ru/andreev/billing/token_get.php