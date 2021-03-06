/* eslint-disable prettier/prettier */
/* eslint-disable brace-style */
/* eslint-disable max-len */
'use strict';

/***************************************************************************************
 *
 *  이름 붙이기 규칙(2017.1.16)
 *
 *  1. 변수에 해당하는 이름들은 모두 소문자
 *  2. 이어지는 추가 이름은 '_'를 붙여서 연결
 *
 ***************************************************************************************/


/***************************************************************************************
 *  장치 기본 정의
 ***************************************************************************************/

RoCode.byrobot_petrone_v2_base =
{
    /***************************************************************************************
     *  시간 지연 함수
     ***************************************************************************************/

    // 시간 지연
    checkFinish(script, ms)
    {
        const _ms = this.fit(0, ms, 60000);

        if (!script.isStart)
        {
            script.isStart = true;
            script.timeFlag = 1;

            const fps = RoCode.FPS || 60;
            const timeValue = (60 / fps) * _ms;

            setTimeout(() => {
                script.timeFlag = 0;
            }, timeValue);

            return 'Start';
        }
        else if (script.timeFlag == 1)
        {
            return 'Running';
        }
        else
        {
            delete script.timeFlag;
            delete script.isStart;
            RoCode.engine.isContinue = false;
            return 'Finish';
        }
    },


    /***************************************************************************************
     *  기능 함수
     ***************************************************************************************/

    transferBufferClear()
    {
        RoCode.hw.setDigitalPortValue('buffer_clear', 0);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['buffer_clear'];
    },


    fit(min, value, max)
    {
        return Math.max(Math.min(value, max), min);
    },


    /***************************************************************************************
     *  데이터 전송 함수 (RoCode -> Hardware)
     ***************************************************************************************/

    // 데이터 전송
    transferLightManual(target, flags, brightness)
    {
        // 범위 조정
        target      = this.fit(0, target, 255);
        flags       = this.fit(0, flags, 255);
        brightness  = this.fit(0, brightness, 255);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('light_manual_flags', flags);
        RoCode.hw.setDigitalPortValue('light_manual_brightness', brightness);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['light_manual_flags'];
        delete RoCode.hw.sendQueue['light_manual_brightness'];
    },


    transferLightMode(target, mode, interval)
    {
        // 범위 조정
        target = Math.max(target, 0);
        target = Math.min(target, 255);
        mode = Math.max(mode, 0);
        mode = Math.min(mode, 255);
        interval = Math.max(interval, 0);
        interval = Math.min(interval, 65535);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('light_mode_mode', mode);
        RoCode.hw.setDigitalPortValue('light_mode_interval', interval);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['light_mode_mode'];
        delete RoCode.hw.sendQueue['light_mode_interval'];
    },


    transferLightModeColor(target, mode, interval, red, green, blue)
    {
        // 범위 조정
        target      = this.fit(0, target,   255);
        mode        = this.fit(0, mode,     255);
        interval    = this.fit(0, interval, 65535);
        red         = this.fit(0, red,      255);
        green       = this.fit(0, green,    255);
        blue        = this.fit(0, blue,     255);

        // 전송
        RoCode.hw.setDigitalPortValue('target',              target);
        RoCode.hw.setDigitalPortValue('light_mode_mode',     mode);
        RoCode.hw.setDigitalPortValue('light_mode_interval', interval);
        RoCode.hw.setDigitalPortValue('light_color_r',       red);
        RoCode.hw.setDigitalPortValue('light_color_g',       green);
        RoCode.hw.setDigitalPortValue('light_color_b',       blue);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['light_mode_mode'];
        delete RoCode.hw.sendQueue['light_mode_interval'];
        delete RoCode.hw.sendQueue['light_color_r'];
        delete RoCode.hw.sendQueue['light_color_g'];
        delete RoCode.hw.sendQueue['light_color_b'];
    },


    transferDisplayClearAll(target, pixel)
    {
        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_clearall_pixel', pixel);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_clearall_pixel'];
    },



    transferDisplayClear(target, pixel, x, y, width, height)
    {
        // 범위 조정
        x      = this.fit(0, x, 128);
        y      = this.fit(0, y, 64);
        width  = this.fit(0, width, 128);
        height = this.fit(0, height, 64);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_clear_x', x);
        RoCode.hw.setDigitalPortValue('display_clear_y', y);
        RoCode.hw.setDigitalPortValue('display_clear_width', width);
        RoCode.hw.setDigitalPortValue('display_clear_height', height);
        RoCode.hw.setDigitalPortValue('display_clear_pixel', pixel);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_clear_x'];
        delete RoCode.hw.sendQueue['display_clear_y'];
        delete RoCode.hw.sendQueue['display_clear_width'];
        delete RoCode.hw.sendQueue['display_clear_height'];
        delete RoCode.hw.sendQueue['display_clear_pixel'];
    },


    transferDisplayInvert(target, x, y, width, height)
    {
        // 범위 조정
        x      = this.fit(0, x, 128);
        y      = this.fit(0, y, 64);
        width  = this.fit(0, width, 128);
        height = this.fit(0, height, 64);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_invert_x', x);
        RoCode.hw.setDigitalPortValue('display_invert_y', y);
        RoCode.hw.setDigitalPortValue('display_invert_width', width);
        RoCode.hw.setDigitalPortValue('display_invert_height', height);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_invert_x'];
        delete RoCode.hw.sendQueue['display_invert_y'];
        delete RoCode.hw.sendQueue['display_invert_width'];
        delete RoCode.hw.sendQueue['display_invert_height'];
    },


    transferDisplayDrawPoint(target, x, y, pixel)
    {
        // 범위 조정
        x = this.fit(0, x, 128);
        y = this.fit(0, y, 64);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_draw_point_x', x);
        RoCode.hw.setDigitalPortValue('display_draw_point_y', y);
        RoCode.hw.setDigitalPortValue('display_draw_point_pixel', pixel);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_draw_point_x'];
        delete RoCode.hw.sendQueue['display_draw_point_y'];
        delete RoCode.hw.sendQueue['display_draw_point_pixel'];
    },


    transferDisplayDrawLine(target, x1, y1, x2, y2, pixel, line)
    {
        // 범위 조정
        x1 = this.fit(0, x1, 128);
        y1 = this.fit(0, y1, 64);
        x2 = this.fit(0, x2, 128);
        y2 = this.fit(0, y2, 64);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_draw_line_x1', x1);
        RoCode.hw.setDigitalPortValue('display_draw_line_y1', y1);
        RoCode.hw.setDigitalPortValue('display_draw_line_x2', x2);
        RoCode.hw.setDigitalPortValue('display_draw_line_y2', y2);
        RoCode.hw.setDigitalPortValue('display_draw_line_pixel', pixel);
        RoCode.hw.setDigitalPortValue('display_draw_line_line', line);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_draw_line_x1'];
        delete RoCode.hw.sendQueue['display_draw_line_y1'];
        delete RoCode.hw.sendQueue['display_draw_line_x2'];
        delete RoCode.hw.sendQueue['display_draw_line_y2'];
        delete RoCode.hw.sendQueue['display_draw_line_pixel'];
        delete RoCode.hw.sendQueue['display_draw_line_line'];
    },


    transferDisplayDrawRect(target, x, y, width, height, pixel, flagFill, line)
    {
        // 범위 조정
        x      = this.fit(0, x, 128);
        y      = this.fit(0, y, 64);
        width  = this.fit(0, width, 128);
        height = this.fit(0, height, 64);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_draw_rect_x', x);
        RoCode.hw.setDigitalPortValue('display_draw_rect_y', y);
        RoCode.hw.setDigitalPortValue('display_draw_rect_width', width);
        RoCode.hw.setDigitalPortValue('display_draw_rect_height', height);
        RoCode.hw.setDigitalPortValue('display_draw_rect_pixel', pixel);
        RoCode.hw.setDigitalPortValue('display_draw_rect_flagfill', flagFill);
        RoCode.hw.setDigitalPortValue('display_draw_rect_line', line);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_draw_rect_x'];
        delete RoCode.hw.sendQueue['display_draw_rect_y'];
        delete RoCode.hw.sendQueue['display_draw_rect_width'];
        delete RoCode.hw.sendQueue['display_draw_rect_height'];
        delete RoCode.hw.sendQueue['display_draw_rect_pixel'];
        delete RoCode.hw.sendQueue['display_draw_rect_flagfill'];
        delete RoCode.hw.sendQueue['display_draw_rect_line'];
    },


    transferDisplayDrawCircle(target, x, y, radius, pixel, flagFill)
    {
        // 범위 조정
        x      = this.fit(-50, x, 178);
        y      = this.fit(-50, y, 114);
        radius = this.fit(1, radius, 200);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_draw_circle_x', x);
        RoCode.hw.setDigitalPortValue('display_draw_circle_y', y);
        RoCode.hw.setDigitalPortValue('display_draw_circle_radius', radius);
        RoCode.hw.setDigitalPortValue('display_draw_circle_pixel', pixel);
        RoCode.hw.setDigitalPortValue('display_draw_circle_flagfill', flagFill);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_draw_circle_x'];
        delete RoCode.hw.sendQueue['display_draw_circle_y'];
        delete RoCode.hw.sendQueue['display_draw_circle_radius'];
        delete RoCode.hw.sendQueue['display_draw_circle_pixel'];
        delete RoCode.hw.sendQueue['display_draw_circle_flagfill'];
    },


    transferDisplayDrawString(target, x, y, font, pixel, string)
    {
        // 범위 조정
        x = this.fit(0, x, 120);
        y = this.fit(0, y, 60);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_draw_string_x', x);
        RoCode.hw.setDigitalPortValue('display_draw_string_y', y);
        RoCode.hw.setDigitalPortValue('display_draw_string_font', font);
        RoCode.hw.setDigitalPortValue('display_draw_string_pixel', pixel);
        RoCode.hw.setDigitalPortValue('display_draw_string_string', string);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_draw_string_x'];
        delete RoCode.hw.sendQueue['display_draw_string_y'];
        delete RoCode.hw.sendQueue['display_draw_string_font'];
        delete RoCode.hw.sendQueue['display_draw_string_pixel'];
        delete RoCode.hw.sendQueue['display_draw_string_string'];
    },


    transferDisplayDrawStringAlign(target, xStart, xEnd, y, align, font, pixel, string)
    {
        // 범위 조정
        xStart = this.fit(0, xStart, 124);
        xEnd   = this.fit(0, xEnd, 128)
        y      = this.fit(0, y, 60);

        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_x_start', xStart);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_x_end', xEnd);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_y', y);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_align', align);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_font', font);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_pixel', pixel);
        RoCode.hw.setDigitalPortValue('display_draw_string_align_string', string);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['display_draw_string_align_x_start'];
        delete RoCode.hw.sendQueue['display_draw_string_align_x_end'];
        delete RoCode.hw.sendQueue['display_draw_string_align_y'];
        delete RoCode.hw.sendQueue['display_draw_string_align_align'];
        delete RoCode.hw.sendQueue['display_draw_string_align_font'];
        delete RoCode.hw.sendQueue['display_draw_string_align_pixel'];
        delete RoCode.hw.sendQueue['display_draw_string_align_string'];
    },


    transferBuzzer(mode, value, time)
    {
        // 전송
        RoCode.hw.setDigitalPortValue('target', 0x31);
        RoCode.hw.setDigitalPortValue('buzzer_mode', mode);
        RoCode.hw.setDigitalPortValue('buzzer_value', value);
        RoCode.hw.setDigitalPortValue('buzzer_time', time);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['buzzer_mode'];
        delete RoCode.hw.sendQueue['buzzer_value'];
        delete RoCode.hw.sendQueue['buzzer_time'];
    },


    transferVibrator(mode, timeOn, timeOff, timeRun)
    {
        // 범위 조정
        timeOn  = this.fit(1, timeOn, 60000);
        timeOff = this.fit(1, timeOff, 60000);

        // 전송
        RoCode.hw.setDigitalPortValue('target', 0x31);
        RoCode.hw.setDigitalPortValue('vibrator_mode', mode);
        RoCode.hw.setDigitalPortValue('vibrator_on', timeOn);
        RoCode.hw.setDigitalPortValue('vibrator_off', timeOff);
        RoCode.hw.setDigitalPortValue('vibrator_total', timeRun);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['vibrator_mode'];
        delete RoCode.hw.sendQueue['vibrator_on'];
        delete RoCode.hw.sendQueue['vibrator_off'];
        delete RoCode.hw.sendQueue['vibrator_total'];
    },


    transferIrMessage(irdirection, irmessage)
    {
        // 범위 조정
        irmessage = this.fit(-2147483647, irmessage, 2147483647);

        // 전송
        RoCode.hw.setDigitalPortValue('target', 0x30);
        RoCode.hw.setDigitalPortValue('irmessage_direction', irdirection);
        RoCode.hw.setDigitalPortValue('irmessage_irdata', irmessage);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['irmessage_direction'];
        delete RoCode.hw.sendQueue['irmessage_irdata'];
    },


    transferMotorSingle(motorIndex, motorRotation, motorSpeed)
    {
        // 범위 조정
        motorSpeed = this.fit(0, motorSpeed, 4096);

        // 전송
        RoCode.hw.setDigitalPortValue('target', 0x30);
        RoCode.hw.setDigitalPortValue('motorsingle_target', motorIndex);
        RoCode.hw.setDigitalPortValue('motorsingle_rotation', motorRotation);
        RoCode.hw.setDigitalPortValue('motorsingle_value', motorSpeed);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['motorsingle_target'];
        delete RoCode.hw.sendQueue['motorsingle_rotation'];
        delete RoCode.hw.sendQueue['motorsingle_value'];
    },


    transferCommand(target, command, option)
    {
        // 전송
        RoCode.hw.setDigitalPortValue('target', target);
        RoCode.hw.setDigitalPortValue('command_command', command);
        RoCode.hw.setDigitalPortValue('command_option', option);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['command_command'];
        delete RoCode.hw.sendQueue['command_option'];
    },


    transferControlDouble(wheel, accel)
    {
        // 범위 조정
        wheel = this.fit(-100, wheel, 100);
        accel = this.fit(-100, accel, 100);

        // 전송
        RoCode.hw.setDigitalPortValue('target', 0x30);
        RoCode.hw.setDigitalPortValue('control_wheel', wheel);
        RoCode.hw.setDigitalPortValue('control_accel', accel);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['control_wheel'];
        delete RoCode.hw.sendQueue['control_accel'];
    },


    transferControlQuad(roll, pitch, yaw, throttle)
    {
        // 범위 조정
        roll     = this.fit(-100, roll, 100);
        pitch    = this.fit(-100, pitch, 100);
        yaw      = this.fit(-100, yaw, 100);
        throttle = this.fit(-100, throttle, 100);

        // 전송
        RoCode.hw.setDigitalPortValue('target', 0x30);
        RoCode.hw.setDigitalPortValue('control_roll', roll);
        RoCode.hw.setDigitalPortValue('control_pitch', pitch);
        RoCode.hw.setDigitalPortValue('control_yaw', yaw);
        RoCode.hw.setDigitalPortValue('control_throttle', throttle);

        RoCode.hw.update();

        delete RoCode.hw.sendQueue['target'];
        delete RoCode.hw.sendQueue['control_roll'];
        delete RoCode.hw.sendQueue['control_pitch'];
        delete RoCode.hw.sendQueue['control_yaw'];
        delete RoCode.hw.sendQueue['control_throttle'];
    },


    /***************************************************************************************
     *  블럭 연동 함수
     ***************************************************************************************/

    // 데이터 읽기
    getData(script, device)
    {
        return RoCode.hw.portData[device];
    },


    // LED 수동 설정
    setLightManual(script, target, flags, brightness)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferLightManual(target, flags, brightness);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // LED 수동 설정 - RGB 값 직접 지정
    setLightModeColor(script, target, mode, interval, red, green, blue)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferLightModeColor(target, mode, interval, red, green, blue);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // 화면 전체 지우기, 선택 영역 지우기
    setDisplayClearAll(script, target, pixel)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayClearAll(target, pixel);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면 전체 지우기, 선택 영역 지우기
    setDisplayClear(script, target, pixel, x, y, width, height)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayClear(target, pixel, x, y, width, height);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 선택 영역 반전
    setDisplayInvert(script, target, x, y, width, height)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayInvert(target, x, y, width, height);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면에 점 찍기
    setDisplayDrawPoint(script, target, x, y, pixel)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayDrawPoint(target, x, y, pixel);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면에 선 그리기
    setDisplayDrawLine(script, target, x1, y1, x2, y2, pixel, line)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayDrawLine(target, x1, y1, x2, y2, pixel, line);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면에 사각형 그리기
    setDisplayDrawRect(script, target, x, y, width, height, pixel, flagFill, line)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayDrawRect(target, x, y, width, height, pixel, flagFill, line);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면에 원 그리기
    setDisplayDrawCircle(script, target, x, y, radius, pixel, flagFill)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayDrawCircle(target, x, y, radius, pixel, flagFill);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면에 문자열 쓰기
    setDisplayDrawString(script, target, x, y, font, pixel, string)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayDrawString(target, x, y, font, pixel, string);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // OLED - 화면에 문자열 정렬하여 그리기
    setDisplayDrawStringAlign(script, target, xStart, xEnd, y, align, font, pixel, string)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferDisplayDrawStringAlign(target, xStart, xEnd, y, align, font, pixel, string);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // 버저 설정(함수 호출 시 시간은 모두 ms 단위 사용)
    /*
        MuteInstantally     = 1,    // 묵음 즉시 적용
        MuteContinually     = 2,    // 묵음 예약

        ScaleInstantally    = 3,    // 음계 즉시 적용
        ScaleContinually    = 4,    // 음계 예약

        HzInstantally       = 5,    // 주파수 즉시 적용
        HzContinually       = 6,    // 주파수 예약
     */
    // 정지
    setBuzzerStop(script)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferBuzzer(0, 0, 0);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // 묵음
    setBuzzerMute(script, time, flagDelay, flagInstantly)
    {
        time = this.fit(0, time, 60000);

        let timeDelay = 40;
        if (flagDelay)
        {
            timeDelay = Math.max(timeDelay, time);
        }

        switch (this.checkFinish(script, timeDelay))
        {
            case 'Start':
                {
                    let mode = 2; // 묵음 연속
                    if (flagInstantly)
                    {
                        mode = 1;
                    } // 묵음 즉시

                    this.transferBuzzer(mode, 0xee, time);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    setBuzzerScale(script, octave, scale, time, flagDelay, flagInstantly)
    {
        time = this.fit(0, time, 60000);

        let timeDelay = 40;
        if (flagDelay)
        {
            timeDelay = Math.max(timeDelay, time);
        }

        switch (this.checkFinish(script, timeDelay))
        {
            case 'Start':
                {
                    let mode = 4; // Scale 연속
                    if (flagInstantly)
                    {
                        mode = 3;
                    } // Scale 즉시

                    const scalecalc = octave * 12 + scale;

                    this.transferBuzzer(mode, scalecalc, time);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    setBuzzerHz(script, hz, time, flagDelay, flagInstantly)
    {
        time = this.fit(0, time, 60000);

        let timeDelay = 40;
        if (flagDelay)
        {
            timeDelay = Math.max(timeDelay, time);
        }

        switch (this.checkFinish(script, timeDelay))
        {
            case 'Start':
                {
                    let mode = 6; // Hz 연속
                    if (flagInstantly)
                    {
                        mode = 5;
                    } // Hz 즉시

                    // 범위 조정
                    hz = this.fit(1, hz, 63999);

                    this.transferBuzzer(mode, hz, time);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    // 진동 제어
    /*
        Stop            = 0,    // 정지
        Instantally     = 1,    // 즉시 적용
        Continually     = 2,    // 예약
     */
    setVibratorStop(script)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferVibrator(0, 0, 0, 0);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    setVibrator(script, timeOn, timeOff, timeRun, flagDelay, flagInstantly)
    {
        timeRun = this.fit(0, timeRun, 60000);

        let timeDelay = 40;
        if (flagDelay)
        {
            timeDelay = Math.max(timeDelay, timeRun);
        }

        switch (this.checkFinish(script, timeDelay))
        {
            case 'Start':
                {
                    let mode = 2; // 예약
                    if (flagInstantly)
                    {
                        mode = 1; // 즉시
                    }

                    this.transferVibrator(mode, timeOn, timeOff, timeRun);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendCommand(script, target, command, option)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferCommand(target, command, option);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendIrMessage(script, irdirection, irmessage)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferIrMessage(irdirection, irmessage);
                    // Light Event (transferLightEvent 만들어야 할 듯)
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendStop(script)
    {
        return this.sendCommand(script, 0x30, 0x24, 0);
    },


    setMotorSingle(script, motorIndex, motorRotation, motorSpeed)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferMotorSingle(motorIndex, motorRotation, motorSpeed);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    /*
        None = 0,           // 없음

        Flight = 0x10,      // 비행(가드 포함)
        FlightNoGuard,      // 비행(가드 없음)
        FlightFPV,          // 비행(FPV)

        Drive = 0x20,       // 주행
        DriveFPV,           // 주행(FPV)

        Test = 0x30,        // 테스트
     */
    setModeVehicle(script, modeVehicle)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferCommand(0x30, 0x10, modeVehicle);

                    this.transferControlDouble(0, 0);
                    this.transferControlQuad(0, 0, 0, 0);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    setEventFlight(script, eventFlight, time)
    {
        switch (this.checkFinish(script, time))
        {
            case 'Start':
                {
                    this.transferControlQuad(0, 0, 0, 0); // 기존 입력되었던 조종기 방향 초기화 (수직으로 이륙, 착륙 하도록)
                    this.transferCommand(0x30, 0x22, eventFlight); // 0x22 : CommandType::FlightEvent
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendControlQuadSingle(script, controlTarget, value, time, flagDelay)
    {
        let timeDelay = 40;
        if (flagDelay)
        {
            timeDelay = Math.max(timeDelay, time);
        }

        switch (this.checkFinish(script, timeDelay))
        {
            case 'Start':
                {
                    // 범위 조정
                    value = this.fit(-100, value, 100);

                    // 전송
                    RoCode.hw.setDigitalPortValue('target', 0x30);
                    RoCode.hw.setDigitalPortValue(controlTarget, value);

                    RoCode.hw.update();

                    delete RoCode.hw.sendQueue['target'];
                    delete RoCode.hw.sendQueue[controlTarget];
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                if (flagDelay)
                {
                    // 블럭을 빠져나갈 때 변경했던 값을 초기화

                    // 전송
                    RoCode.hw.setDigitalPortValue('target', 0x30);
                    RoCode.hw.setDigitalPortValue(controlTarget, 0);

                    RoCode.hw.update();

                    delete RoCode.hw.sendQueue['target'];
                    delete RoCode.hw.sendQueue[controlTarget];
                }
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendControlQuad(script, roll, pitch, yaw, throttle, time, flagDelay)
    {
        let timeDelay = 40;
        if (flagDelay)
        {
            timeDelay = Math.max(timeDelay, time);
        }

        switch (this.checkFinish(script, timeDelay))
        {
            case 'Start':
                {
                    this.transferControlQuad(roll, pitch, yaw, throttle);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                if (flagDelay)
                {
                    this.transferControlQuad(0, 0, 0, 0);
                }
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },
};


module.exports = RoCode.byrobot_petrone_v2_base;

