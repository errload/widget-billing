// billing
define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function($, _, Twig, Modal) {
    var CustomWidget_WidgetBilling = function() {
        var self = this,
            system = self.system,
            url_link_t = "https://integratorgroup.k-on.ru/andreev/billing/templates.php";

        // записываем отмеченных в настройках пользователей в массив managers
        const configToObject = function () {
            var config_settings = self.get_settings().config_settings || {};
            if (typeof config_settings !== 'string') config_settings = JSON.stringify(config_settings);
            config_settings = JSON.parse(config_settings);

            return config_settings;
        }

        // запуск таймера
        const startTimer = function () {
            $('.billing__link').bind('click', function (e) {
                e.preventDefault();

                // запуск модалки
                new Modal({
                    class_name: 'start__timer',
                    init: function ($modal_body) {
                        var $this = $(this);
                        $modal_body
                            .trigger('modal:loaded')
                            .html(`
                            <div class="modal__main-block" style="width: 100%; min-height: 0px;">
                                <h2 class="modal-body__caption head_2">Запуск таймера</h2>
                            </div>
                        `)
                            .trigger('modal:centrify')
                            .append('');
                    },
                    destroy: function () {}
                });

                // ссылка на проект
                var linkProject = `<a href="#" class="modal__link-project" style="
                        margin-top: 3px;
                        text-decoration: none;
                        color: #1375ab;
                        word-break: break-all;
                    " target="_blank">http://bla.bla/
                </a>`;

                // изменение ссылки
                var changeLinkProject = `<a href="#" class="change__link-project" style="
                        text-decoration: none;
                        color: #6b6d72;
                    ">(изменить)
                </a>`;

                // поле ввода ссылки
                var inputLinkProject = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-project',
                    class_name: 'modal__input__link-project',
                    value: '',
                    placeholder: 'вставьте ссылку на проект'
                });

                // wrapper
                var linkProjectWrapper = `<div class="modal__link-project__wrapper" style="width: 100%;">
                    <span style="width: 100%;">Ссылка на проект:</span><br/>
                </div>`;

                // добавляем ссылку проекта и ссылку (изменить)
                $('.modal__main-block').append(linkProjectWrapper);
                $('.modal__link-project__wrapper').append(linkProject);
                $('.modal__link-project').after(changeLinkProject);

                // удаляем ссылку и вставляем поле ввода ссылки
                const changeLink = function (e) {
                    e.preventDefault();

                    $('.modal__link-project__wrapper').append(inputLinkProject);
                    $('.modal__input__link-project').css({
                        'width': '100%',
                        'margin-top': '3px'
                    }).focus();
                    $('.modal__input__link-project').val($('.modal__link-project').text().trim());
                    $('.modal__link-project').remove();
                    $('.change__link-project').remove();

                    // меняем ссылку, удаляем поле ввода и возвращаем ссылку
                    $('.modal__input__link-project').focusout(function (e) {
                        e.preventDefault();

                        $('.modal__link-project__wrapper').append(linkProject);
                        $('.modal__link-project').text($('.modal__input__link-project').val().trim() + ' ');
                        $('.modal__link-project').after(changeLinkProject);
                        $('.modal__input__link-project').remove();
                        $('.change__link-project').bind('click', changeLink);
                    });
                }
                $('.change__link-project').bind('click', changeLink);








                // кнопки Сохранить и Отменить
                var startBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'modal__startBtn-timer',
                        text: 'Запустить'
                    }),
                    closeBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                        class_name: 'modal__closeBtn-timer',
                        text: 'Закрыть'
                    }),
                    btnWrapper = '<div class="modal-body__actions" style="width: 100%; text-align: right;"></div>';

                $('.modal__main-block').append(btnWrapper);
                $('.modal-body__actions').append(startBtn);
                $('.modal-body__actions').append(closeBtn);
                $('.modal-body__actions').css('margin-top', '20px');

                // чтобы модальное окно не прижималось книзу (не смог исправить стандартный вариант)
                // $('.modal__main-block').append('<div class="modal__bottom" style="position: absolute; height: 70px; width: 100%"></div>');

                // нажатие на кнопку Запустить
                $('.modal__startBtn-timer').unbind('click');
                $('.modal__startBtn-timer').bind('click', function () {
                    console.log('click');
                });
            });
        }

        this.callbacks = {
            settings: function() {
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
                // ссылка на запуск таймера
                self.render_template({
                    body: '',
                    caption: { class_name: 'widget__billing' },
                    render: `<a href="#" class="billing__link" style="
                            font-size: 16px;
                            text-decoration: none;
                            color: #1375ab;
                            margin-left: 12px;
                            margin-top: 10px;
                        ">Запустить таймер</a>`
                });

                // запускаем модалку с таймером
                startTimer();

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