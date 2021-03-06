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

RoCode.byrobot_base =
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
        RoCode.hw.sendQueue.buffer_clear = 0;
        RoCode.hw.update();
        delete RoCode.hw.sendQueue.buffer_clear;
    },


    fit(min, value, max)
    {
        return Math.max(Math.min(value, max), min);
    },


    /***************************************************************************************
     *  데이터 전송 함수 (RoCode -> Hardware)
     ***************************************************************************************/

    // 데이터 전송
    transferIrMessage(target, irmessage)
    {
        // 전송
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.battle_ir_message = irmessage;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.battle_ir_message;
    },


    transferLightManual(target, flags, brightness)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.light_manual_flags = flags;
        RoCode.hw.sendQueue.light_manual_brightness = brightness;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.light_manual_flags;
        delete RoCode.hw.sendQueue.light_manual_brightness;
    },


    transferLightMode(target, mode, interval)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.light_mode_mode = mode;
        RoCode.hw.sendQueue.light_mode_interval = interval;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.light_mode_mode;
        delete RoCode.hw.sendQueue.light_mode_interval;
    },


    transferLightModeColor(target, mode, interval, red, green, blue)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.light_mode_mode = mode;
        RoCode.hw.sendQueue.light_mode_interval = interval;
        RoCode.hw.sendQueue.light_color_r = red;
        RoCode.hw.sendQueue.light_color_g = green;
        RoCode.hw.sendQueue.light_color_b = blue;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.light_mode_mode;
        delete RoCode.hw.sendQueue.light_mode_interval;
        delete RoCode.hw.sendQueue.light_color_r;
        delete RoCode.hw.sendQueue.light_color_g;
        delete RoCode.hw.sendQueue.light_color_b;
    },


    transferLightEvent(target, event, interval, repeat)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.light_event_event = event;
        RoCode.hw.sendQueue.light_event_interval = interval;
        RoCode.hw.sendQueue.light_event_repeat = repeat;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.light_event_event;
        delete RoCode.hw.sendQueue.light_event_interval;
        delete RoCode.hw.sendQueue.light_event_repeat;
    },


    transferLightEventColor(target, event, interval, repeat, red, green, blue)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.light_event_event = event;
        RoCode.hw.sendQueue.light_event_interval = interval;
        RoCode.hw.sendQueue.light_event_repeat = repeat;
        RoCode.hw.sendQueue.light_color_r = red;
        RoCode.hw.sendQueue.light_color_g = green;
        RoCode.hw.sendQueue.light_color_b = blue;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.light_event_event;
        delete RoCode.hw.sendQueue.light_event_interval;
        delete RoCode.hw.sendQueue.light_event_repeat;
        delete RoCode.hw.sendQueue.light_color_r;
        delete RoCode.hw.sendQueue.light_color_g;
        delete RoCode.hw.sendQueue.light_color_b;
    },


    transferDisplayClearAll(target, pixel)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_clear_all_pixel = pixel;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_clear_all_pixel;
    },


    transferDisplayClear(target, pixel, x, y, width, height)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_clear_x = x;
        RoCode.hw.sendQueue.display_clear_y = y;
        RoCode.hw.sendQueue.display_clear_width = width;
        RoCode.hw.sendQueue.display_clear_height = height;
        RoCode.hw.sendQueue.display_clear_pixel = pixel;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_clear_x;
        delete RoCode.hw.sendQueue.display_clear_y;
        delete RoCode.hw.sendQueue.display_clear_width;
        delete RoCode.hw.sendQueue.display_clear_height;
        delete RoCode.hw.sendQueue.display_clear_pixel;
    },


    transferDisplayInvert(target, x, y, width, height)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_invert_x = x;
        RoCode.hw.sendQueue.display_invert_y = y;
        RoCode.hw.sendQueue.display_invert_width = width;
        RoCode.hw.sendQueue.display_invert_height = height;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_invert_x;
        delete RoCode.hw.sendQueue.display_invert_y;
        delete RoCode.hw.sendQueue.display_invert_width;
        delete RoCode.hw.sendQueue.display_invert_height;
    },


    transferDisplayDrawPoint(target, x, y, pixel)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_draw_point_x = x;
        RoCode.hw.sendQueue.display_draw_point_y = y;
        RoCode.hw.sendQueue.display_draw_point_pixel = pixel;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_draw_point_x;
        delete RoCode.hw.sendQueue.display_draw_point_y;
        delete RoCode.hw.sendQueue.display_draw_point_pixel;
    },


    transferDisplayDrawLine(target, x1, y1, x2, y2, pixel, line)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_draw_line_x1 = x1;
        RoCode.hw.sendQueue.display_draw_line_y1 = y1;
        RoCode.hw.sendQueue.display_draw_line_x2 = x2;
        RoCode.hw.sendQueue.display_draw_line_y2 = y2;
        RoCode.hw.sendQueue.display_draw_line_pixel = pixel;
        RoCode.hw.sendQueue.display_draw_line_line = line;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_draw_line_x1;
        delete RoCode.hw.sendQueue.display_draw_line_y1;
        delete RoCode.hw.sendQueue.display_draw_line_x2;
        delete RoCode.hw.sendQueue.display_draw_line_y2;
        delete RoCode.hw.sendQueue.display_draw_line_pixel;
        delete RoCode.hw.sendQueue.display_draw_line_line;
    },


    transferDisplayDrawRect(target, x, y, width, height, pixel, flagFill, line)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_draw_rect_x = x;
        RoCode.hw.sendQueue.display_draw_rect_y = y;
        RoCode.hw.sendQueue.display_draw_rect_width = width;
        RoCode.hw.sendQueue.display_draw_rect_height = height;
        RoCode.hw.sendQueue.display_draw_rect_pixel = pixel;
        RoCode.hw.sendQueue.display_draw_rect_flagfill = flagFill;
        RoCode.hw.sendQueue.display_draw_rect_line = line;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_draw_rect_x;
        delete RoCode.hw.sendQueue.display_draw_rect_y;
        delete RoCode.hw.sendQueue.display_draw_rect_width;
        delete RoCode.hw.sendQueue.display_draw_rect_height;
        delete RoCode.hw.sendQueue.display_draw_rect_pixel;
        delete RoCode.hw.sendQueue.display_draw_rect_flagfill;
        delete RoCode.hw.sendQueue.display_draw_rect_line;
    },


    transferDisplayDrawCircle(target, x, y, radius, pixel, flagFill)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_draw_circle_x = x;
        RoCode.hw.sendQueue.display_draw_circle_y = y;
        RoCode.hw.sendQueue.display_draw_circle_radius = radius;
        RoCode.hw.sendQueue.display_draw_circle_pixel = pixel;
        RoCode.hw.sendQueue.display_draw_circle_flagfill = flagFill;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_draw_circle_x;
        delete RoCode.hw.sendQueue.display_draw_circle_y;
        delete RoCode.hw.sendQueue.display_draw_circle_radius;
        delete RoCode.hw.sendQueue.display_draw_circle_pixel;
        delete RoCode.hw.sendQueue.display_draw_circle_flagfill;
    },

    transferDisplayDrawString(target, x, y, font, pixel, string)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_draw_string_x = x;
        RoCode.hw.sendQueue.display_draw_string_y = y;
        RoCode.hw.sendQueue.display_draw_string_font = font;
        RoCode.hw.sendQueue.display_draw_string_pixel = pixel;
        RoCode.hw.sendQueue.display_draw_string_string = string;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_draw_string_x;
        delete RoCode.hw.sendQueue.display_draw_string_y;
        delete RoCode.hw.sendQueue.display_draw_string_font;
        delete RoCode.hw.sendQueue.display_draw_string_pixel;
        delete RoCode.hw.sendQueue.display_draw_string_string;
    },

    transferDisplayDrawStringAlign(target, xStart, xEnd, y, align, font, pixel, string)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.display_draw_string_align_x_start = xStart;
        RoCode.hw.sendQueue.display_draw_string_align_x_end = xEnd;
        RoCode.hw.sendQueue.display_draw_string_align_y = y;
        RoCode.hw.sendQueue.display_draw_string_align_align = align;
        RoCode.hw.sendQueue.display_draw_string_align_font = font;
        RoCode.hw.sendQueue.display_draw_string_align_pixel = pixel;
        RoCode.hw.sendQueue.display_draw_string_align_string = string;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.display_draw_string_align_x_start;
        delete RoCode.hw.sendQueue.display_draw_string_align_x_end;
        delete RoCode.hw.sendQueue.display_draw_string_align_y;
        delete RoCode.hw.sendQueue.display_draw_string_align_align;
        delete RoCode.hw.sendQueue.display_draw_string_align_font;
        delete RoCode.hw.sendQueue.display_draw_string_align_pixel;
        delete RoCode.hw.sendQueue.display_draw_string_align_string;
    },

    transferBuzzer(target, mode, value, time)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.buzzer_mode = mode;
        RoCode.hw.sendQueue.buzzer_value = value;
        RoCode.hw.sendQueue.buzzer_time = time;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.buzzer_mode;
        delete RoCode.hw.sendQueue.buzzer_value;
        delete RoCode.hw.sendQueue.buzzer_time;
    },

    transferVibrator(target, mode, timeOn, timeOff, timeRun)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.vibrator_mode = mode;
        RoCode.hw.sendQueue.vibrator_on = timeOn;
        RoCode.hw.sendQueue.vibrator_off = timeOff;
        RoCode.hw.sendQueue.vibrator_total = timeRun;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.vibrator_mode;
        delete RoCode.hw.sendQueue.vibrator_on;
        delete RoCode.hw.sendQueue.vibrator_off;
        delete RoCode.hw.sendQueue.vibrator_total;
    },


    transferMotorSingleRV(target, motorIndex, motorRotation, motorSpeed)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.motorsingle_target = motorIndex;
        RoCode.hw.sendQueue.motorsingle_rotation = motorRotation;
        RoCode.hw.sendQueue.motorsingle_value = motorSpeed;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.motorsingle_target;
        delete RoCode.hw.sendQueue.motorsingle_rotation;
        delete RoCode.hw.sendQueue.motorsingle_value;
    },

    transferMotorSingleV(target, motorIndex, motorSpeed)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.motorsingle_target = motorIndex;
        RoCode.hw.sendQueue.motorsingle_value = motorSpeed;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.motorsingle_target;
        delete RoCode.hw.sendQueue.motorsingle_value;
    },

    transferCommand(target, command, option)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.command_command = command;
        RoCode.hw.sendQueue.command_option = option;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.command_command;
        delete RoCode.hw.sendQueue.command_option;
    },

    transferControlQuad(target, roll, pitch, yaw, throttle)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.control_quad8_roll = roll;
        RoCode.hw.sendQueue.control_quad8_pitch = pitch;
        RoCode.hw.sendQueue.control_quad8_yaw = yaw;
        RoCode.hw.sendQueue.control_quad8_throttle = throttle;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.control_quad8_roll;
        delete RoCode.hw.sendQueue.control_quad8_pitch;
        delete RoCode.hw.sendQueue.control_quad8_yaw;
        delete RoCode.hw.sendQueue.control_quad8_throttle;
    },

    transferControlPosition(target, x, y, z, velocity, heading, rotationalVelocity)
    {
        RoCode.hw.sendQueue.target = target;
        RoCode.hw.sendQueue.control_position_x = x;
        RoCode.hw.sendQueue.control_position_y = y;
        RoCode.hw.sendQueue.control_position_z = z;
        RoCode.hw.sendQueue.control_position_velocity = velocity;
        RoCode.hw.sendQueue.control_position_heading = heading;
        RoCode.hw.sendQueue.control_position_rotational_velocity = rotationalVelocity;

        RoCode.hw.update();

        delete RoCode.hw.sendQueue.target;
        delete RoCode.hw.sendQueue.control_position_x;
        delete RoCode.hw.sendQueue.control_position_y;
        delete RoCode.hw.sendQueue.control_position_z;
        delete RoCode.hw.sendQueue.control_position_velocity;
        delete RoCode.hw.sendQueue.control_position_heading;
        delete RoCode.hw.sendQueue.control_position_rotational_velocity;
    },


    /***************************************************************************************
     *  기능
     ***************************************************************************************/

    // 데이터 읽기
    getData(script, device)
    {
        return RoCode.hw.portData[device];
    },


    getRgbFromString(stringColor)
    {
        let red = 0;
        let green = 0;
        let blue = 0;

        switch (stringColor)
        {
            case 'red':             { red = 255;  green = 0;    blue = 0;   }   break;
            case 'green':           { red = 0;    green = 255;  blue = 0;   }   break;
            case 'blue':            { red = 0;    green = 0;    blue = 255; }   break;
            case 'cyan':            { red = 0;    green = 255;  blue = 255; }   break;
            case 'magenta':         { red = 255;  green = 0;    blue = 255; }   break;
            case 'yellow':          { red = 255;  green = 255;  blue = 0;   }   break;
            case 'white':           { red = 255;  green = 255;  blue = 255; }   break;
            case 'sunset':          { red = 255;  green = 100;  blue = 0;   }   break;
            case 'cottonCandy':     { red = 20;   green = 250;  blue = 150; }   break;
            case 'muscat':          { red = 70;   green = 255;  blue = 0;   }   break;
            case 'strawberryMilk':  { red = 150;  green = 60;   blue = 20;  }   break;
            case 'emerald':         { red = 0;    green = 255;  blue = 30;  }   break;
            case 'lavender':        { red = 80;   green = 0;    blue = 200; }   break;
        }

        return { r:red, g:green, b:blue };
    },

    
    /***************************************************************************************
     *  블럭 연동 함수
     ***************************************************************************************/

    // IR 데이터 송신
    setIrMessage(script, target, irmessage)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferIrMessage(target, irmessage);
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

    // LED 모드 설정
    setLightMode(script, target, mode, interval)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferLightMode(target, mode, interval);
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

    // LED 모드 설정, RGB
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

    // LED 모드 설정, RGB
    setLightModeColorString(script, target, mode, interval, stringColor)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    const color = this.getRgbFromString(stringColor);
                    this.transferLightModeColor(target, mode, interval, color.r, color.g, color.b);
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

    // LED 이벤트 설정
    setLightEvent(script, target, mode, interval, repeat)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferLightEvent(target, mode, interval, repeat);
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

    // LED 이벤트 설정, RGB
    setLightEventColor(script, target, mode, interval, repeat, red, green, blue)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferLightEventColor(target, mode, interval, repeat, red, green, blue);
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

    // LED 이벤트 설정, RGB
    setLightEventColorString(script, target, mode, interval, repeat, stringColor)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    const color = this.getRgbFromString(stringColor);
                    this.transferLightEventColor(target, mode, interval, repeat, color.r, color.g, color.b);
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

    // 화면 전체 지우기, 선택 영역 지우기
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

    // 선택 영역 반전
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

    // 화면에 점 찍기
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

    // 화면에 선 그리기
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

    // 화면에 사각형 그리기
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

    // 화면에 원 그리기
    setDisplayDrawCircle(script, target, x, y, radius, pixel, flagFill)
    {
        switch (this.checkFinish(script, 40)) {
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

    // 화면에 문자열 쓰기
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

    // 화면에 문자열 정렬하여 그리기
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
    setBuzzerStop(script, target)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferBuzzer(target, 0, 0, 0);
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
    setBuzzerMute(script, target, time, flagDelay, flagInstantly)
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
                    let mode = 2; // 묵음 연속
                    if (flagInstantly)
                    {
                        mode = 1;
                    } // 묵음 즉시

                    this.transferBuzzer(target, mode, 0xee, time);
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

    setBuzzerScale(script, target, octave, scale, time, flagDelay, flagInstantly)
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
                    let mode = 4; // Scale 연속
                    if (flagInstantly)
                    {
                        mode = 3;
                    } // Scale 즉시

                    const scalecalc = octave * 12 + scale;

                    this.transferBuzzer(target, mode, scalecalc, time);
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

    setBuzzerHz(script, target, hz, time, flagDelay, flagInstantly)
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
                    let mode = 6; // Hz 연속
                    if (flagInstantly)
                    {
                        mode = 5;
                    } // Hz 즉시
                    this.transferBuzzer(target, mode, hz, time);
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
    setVibratorStop(script, target)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferVibrator(target, 0, 0, 0, 0);
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

    setVibrator(script, target, timeOn, timeOff, timeRun, flagDelay, flagInstantly)
    {
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

                    this.transferVibrator(target, mode, timeOn, timeOff, timeRun);
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

    sendStop(script, target)
    {
        return this.sendCommand(script, target, 0x01);
    },

    sendCommand(script, target, command, option = 0)
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

    setMotorSingleRV(script, target, motorIndex, motorRotation, motorSpeed)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferMotorSingleRV(target, motorIndex, motorRotation, motorSpeed);
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

    setMotorSingleV(script, target, motorIndex, motorSpeed)
    {
        switch (this.checkFinish(script, 40))
        {
            case 'Start':
                {
                    this.transferMotorSingleV(target, motorIndex, motorSpeed);
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


    setEventFlight(script, target, eventFlight, time)
    {
        switch (this.checkFinish(script, time))
        {
            case 'Start':
                {
                    this.transferControlQuad(0, 0, 0, 0); // 기존 입력되었던 조종기 방향 초기화 (수직으로 이륙, 착륙 하도록)
                    this.transferCommand(target, 0x07, eventFlight); // 0x07 : CommandType::FlightEvent
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


    sendControlQuadSingle(script, target, controlTarget, value, time = 40, flagDelay = false)
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
                    RoCode.hw.sendQueue.target = target;
                    RoCode.hw.sendQueue[controlTarget] = value;

                    RoCode.hw.update();

                    delete RoCode.hw.sendQueue.target;
                    delete RoCode.hw.sendQueue[controlTarget];
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                if (flagDelay)
                {
                    // 블럭을 빠져나갈 때 변경했던 값을 초기화
                    RoCode.hw.sendQueue.target = target;
                    RoCode.hw.sendQueue[controlTarget] = 0;

                    RoCode.hw.update();

                    delete RoCode.hw.sendQueue.target;
                    delete RoCode.hw.sendQueue[controlTarget];
                }
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendControlQuad(script, target, roll, pitch, yaw, throttle, time = 40, flagDelay = false)
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
                    this.transferControlQuad(target, roll, pitch, yaw, throttle);
                }
                return script;

            case 'Running':
                return script;

            case 'Finish':
                if (flagDelay)
                {
                    this.transferControlQuad(target, 0, 0, 0, 0);
                }
                return script.callReturn();

            default:
                return script.callReturn();
        }
    },


    sendControlPosition(script, target, x, y, z, velocity, heading, rotationalVelocity, time = 40, flagDelay = false)
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
                    this.transferControlQuad(target, 0, 0, 0, 0);
                    this.transferControlPosition(target, x, y, z, velocity, heading, rotationalVelocity);
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
};


module.exports = RoCode.byrobot_base;

