/**
 *Obloq implementation method.
 ................
 */
//% weight=10 color=#096670 icon="\uf1eb" block="Obloq_http"
//% groups=["04_IFTTT","03_ThingSpeak", "02_Weather", "01_System"]
namespace Obloq_http {

    let wInfo: string[][] = [
        ["weather", "main", "", "s"],
        ["description", "description", "", "s"],
        ["temperature", "\"temp\"", "", "k"],
        ["humidity", "dity", "", "n"],
        ["temp_min", "temp_min", "", "k"],
        ["temp_max", "temp_max", "", "k"],
        ["speed", "speed", "", "n"],
        ["sunrise", "sunrise", "", "n"],
        ["sunset", "sunset", "", "n"],
        ["timezone", "timezone", "", "n"],
        ["cityName", "name", "", "s"]
    ]

    export enum wType {
        //% block="city name"
        cityName = 10,
        //% block="weather"
        weather = 0,
        //% block="description"
        description = 1,
        //% block="temperature"
        temperature = 2,
        //% block="humidity"
        humidity = 3,
        //% block="low temperature"
        temp_min = 4,
        //% block="maximum temperature"
        temp_max = 5,
        //% block="wind speed"
        speed = 6,        
        //% block="time of sunrise"
        sunrise = 7,
        //% block="time of sunset"
        sunset = 8
    }

    //serial
    let OBLOQ_SERIAL_INIT = false
    let OBLOQ_WIFI_CONNECTED = false
    let OBLOQ_SERIAL_TX = SerialPin.P2
    let OBLOQ_SERIAL_RX = SerialPin.P1
    let OBLOQ_WIFI_SSID = ""
    let OBLOQ_WIFI_PASSWORD = ""
    let OBLOQ_IP = ""
    let cityID = ""
    let weatherKey = ""
    let aa = 0

    export enum cityIDs {
        //% block="Taipei"
        Taipei = 1668341,
        //% block="Hong Kong"
        HongKong = 1819729,
        //% block="Tokyo"
        Tokyo = 1850147,
        //% block="Seoul"
        Seoul = 1835848,
        //% block="Beijing"
        Beijing=1816670,
        //% block="Shanghai"
        Shanghai=1796236,      
        //% block="Singapore"
        Singapore=1880252, 
        //% block="London"
        London=2643743, 
        //% block="Berlin"
        Berlin=2950159, 
        //% block="Paris"
        Paris= 2988507,
        //% block="New York"
        NewYork=5128638, 
        //% block="Sydney"
        Sydney=2147714 
    }

    export enum city2IDs {
        //% block="Keelung"
        Keelung = 6724654,
        //% block="Taipei"
        Taipei = 1668341,
        //% block="Xinbei"
        Xinbei = 1670029,
        //% block="Taoyuan"
        Taoyuan = 1667905,
        //% block="Hsinchu"
        Hsinchu = 1675107,
        //% block="Miaoli"
        Miaoli = 1671971,
        //% block="Taichung"
        Taichung = 1668399,
        //% block="Changhua"
        Changhua = 1679136,
        //% block="Nantou"
        Nantou = 1671564,
        //% block="Yunlin"
        Yunlin = 1665194,
        //% block="Jiayi"
        Jiayi = 1678836,
        //% block="Tainan"
        Tainan = 1668352,
        //% block="Kaohsiung"
        Kaohsiung = 7280289,
        //% block="Pingtung"
        Pingtung = 1670479,
        //% block="Yilan"
        Yilan = 1674197,
        //% block="Hualien"
        Hualien = 1674502,
        //% block="Taitung"
        Taitung = 1668295,
        //% block="Penghu"
        Penghu = 1670651,
        //% block="Jincheng"
        Jincheng = 1678008,
        //% block="Nangan"
        Nangan = 7552914
    }

    function obloqWriteString(text: string): void {
        serial.writeString(text)
    }
    
    /*
    function startWork():void{
        basic.clearScreen()
        led.plot(1, 2)
        led.plot(2, 2)
        led.plot(3, 2)
    }
    */

    function Obloq_serial_init(): void {
        obloqWriteString("123")
        let item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        serial.redirect(
            OBLOQ_SERIAL_TX,
            OBLOQ_SERIAL_RX,
            BaudRate.BaudRate9600
        )
        serial.setRxBufferSize(200)
        serial.setTxBufferSize(100)
        obloqWriteString("\r")
        item = serial.readString()
        obloqWriteString("|1|1|\r")
        item = serial.readUntil("\r")
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        OBLOQ_SERIAL_INIT = true
    }

    function getTimeStr(myTimes: number): string {
        let myTimeStr = ""
        let secs = myTimes % 60
        let mins = Math.trunc(myTimes / 60)
        let hours = Math.trunc(mins / 60)
        mins = mins % 60
        hours = hours % 24
        if (hours < 10)
            myTimeStr = "0" + hours
        else
            myTimeStr = "" + hours
        myTimeStr += ":"
        if (mins < 10)
            myTimeStr = myTimeStr + "0" + mins
        else
            myTimeStr = myTimeStr + mins
        myTimeStr += ":"
        if (secs < 10)
            myTimeStr = myTimeStr + "0" + secs
        else
            myTimeStr = myTimeStr + secs
        return myTimeStr
    }

    function Obloq_connect_wifi(): void {
        if (OBLOQ_SERIAL_INIT) {
            if (!OBLOQ_SERIAL_INIT) {
                Obloq_serial_init()
            }
            let item = "test"
            obloqWriteString("|2|1|" + OBLOQ_WIFI_SSID + "," + OBLOQ_WIFI_PASSWORD + "|\r") //Send wifi account and password instructions
            item = serial.readUntil("\r")
            while (item.indexOf("|2|3|") < 0) {
                item = serial.readUntil("\r")
            }
            OBLOQ_IP = item.substr(5, item.length - 6)
            OBLOQ_WIFI_CONNECTED = true
            basic.showIcon(IconNames.Yes)
        }

    }


    /**
     * Setup Obloq Tx Rx to micro:bit pins and WIFI SSID, password.
     * 設定Obloq的Tx、Rx連接腳位，以及WIFI的名稱及密碼
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param receive to receive ,eg: SerialPin.P1
     * @param send to send ,eg: SerialPin.P2
    */
    //% weight=100 group="01_System"
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=Obloq_WIFI_setup blockGap=5
    //% block="Obloq setup WIFI | Pin set: | Receive data (green wire): %receive| Send data (blue wire): %send | Wi-Fi: | Name: %SSID| Password: %PASSWORD| Start connection"
    export function Obloq_WIFI_setup(/*serial*/receive: SerialPin, send: SerialPin,
                                     /*wifi*/SSID: string, PASSWORD: string
    ):
        void {
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        OBLOQ_WIFI_SSID = SSID
        OBLOQ_WIFI_PASSWORD = PASSWORD
        OBLOQ_SERIAL_TX = send
        OBLOQ_SERIAL_RX = receive
        Obloq_serial_init()
        Obloq_connect_wifi()
    }
/*
    //% weight=99
    //% blockId=Obloq_serial_disconnect
    //% block="Obloq serial disconnect"
    export function Obloq_serial_disconnect(): void {
        OBLOQ_SERIAL_INIT = false
    }
    //% weight=98
    //% blockId=Obloq_serial_reconnect
    //% block="Obloq serial reconnect"
    export function Obloq_serial_reconnect(): void {
        Obloq_serial_init()
    }
*/
    /**
     * return the IP of your Obloq 
     * 取得Obloq的IP
    */ 
    //% weight=97 group="01_System"
    //% blockId=getObloq_IP blockGap=5
    //% block="get Obloq IP address"
    export function getObloq_IP(): string {
        if (OBLOQ_SERIAL_INIT && OBLOQ_WIFI_CONNECTED)
            return OBLOQ_IP
        else
            return ""
    }

    /**
     * return the city ID in the world 
     * 取得某個全球大都市的城市編號
    */ 
    //% weight=95 group="02_Weather"
    //% blockId=getCityID blockGap=5
    //% block="get City ID of %myCity"
    export function getCityID(myCity: cityIDs): string {
        return ("" + myCity)
    }

    /**
     * return the city ID in Taiwan 
     * 取得台灣某個都市或是縣的城市編號
    */ 
    //% weight=94 group="02_Weather"
    //% blockId=getCity2ID blockGap=5
    //% block="get City ID of %myCity | in Taiwan"
    export function getCity2ID(myCity: city2IDs): string {
        return ("" + myCity)
    }

    /**
     * return the weather information about the city from http://openweathermap.org/ 
     * 取得從 http://openweathermap.org/ 得到的某一項氣象資訊
    */
    //% weight=93 group="02_Weather"
    //% blockId=getWeatherInfo blockGap=5
    //% block="get weather data: %myInfo"
    export function getWeatherInfo(myInfo: wType): string {
        return wInfo[myInfo][2]
    }



    /**
     * connect to https://thingspeak.com/ to store the data from micro:bit
     * 連接到 https://thingspeak.com/ 儲存micro:bit所得到的感應器資料
    */
    //% weight=92 group="03_ThingSpeak"
    //% blockId=saveToThingSpeak blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="send data to ThingSpeak :| write key: %myKey field1: %field1 || field2: %field2 field3: %field3 field4: %field4 field5: %field5 field6: %field6 field7: %field7 field8: %field8"
    export function saveToThingSpeak(myKey: string, field1:number, field2?:number, field3?:number, field4?:number, field5?:number, field6?:number, field7?:number, field8?:number): void {
        Obloq_serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        let returnCode=""
        let myArr:number[]=[field1,field2,field3,field4,field5,field6,field7,field8]
        let myUrl = "http://api.thingspeak.com/update?api_key=" + myKey
        for(let i=0;i<myArr.length;i++)
        {
            if (myArr[i]!=null)
                myUrl+="&field"+(i+1)+"="+myArr[i]
            else
                break
        }
        serial.readString()
        obloqWriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200")
            basic.showIcon(IconNames.Yes)
        else
            basic.showIcon(IconNames.No)
    }

    /**
     * connect to IFTTT to trig some event and notify you
     * 連接到IFTTT觸發其他事件
    */
    //% weight=91 group="04_IFTTT"
    //% blockId=sendToIFTTT blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="send data to IFTTT to trig other event:| event name: %eventName| your key: %myKey || value1: %value1 value2: %value2 value3: %value3"
    export function sendToIFTTT(eventName:string, myKey: string, value1?:string, value2?:string, value3?:string): void {
        Obloq_serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        let returnCode=""
        let myArr:string[]=[value1,value2,value3]
        let myUrl = "http://maker.ifttt.com/trigger/"+eventName+"/with/key/" + myKey+"?"
        for(let i=0;i<myArr.length;i++)
        {
            if (myArr[i]!=null)
                myUrl+="&value"+(i+1)+"="+myArr[i]
            else
                break
        }
        serial.readString()
        obloqWriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200")
            basic.showIcon(IconNames.Yes)
        else
            basic.showIcon(IconNames.No)
    }
	
	 //% weight=90 group="05_mqtt"
    //% blockId=connect_to_mqtt blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="connect to mqtt :| server address: %address| Port: %port |User: %user|Password: %password_user "
	
	 export function sendToMQtt (address:string, port:number,user:string,password_user:string){
        Obloq_serial_init()
		 
		  obloqWriteString("|4|1|1|" + address + "|" + port + "|" + user + "|" + password_user + "|\r")
		  
		   basic.showIcon(IconNames.Yes)
		 
		 
		 
		 
     } 
     //% weight=80 group="06_subscrible_topic"
    //% blockId=subcrible blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="subcrible :| name: %topic"

	 export function subcrible (topic:string){
        Obloq_serial_init()
        obloqWriteString("|4|1|2|" +topic + "|\r")


         basic.showIcon(IconNames.Yes)
       
   }


        //% weight=79 group="07_publish"
    //% blockId=publish blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="publish :| name: %topic |Message: %message"

	 export function publish (topic:string,message:string){
        Obloq_serial_init()
    
        obloqWriteString("|4|1|3|" + topic + "|" + message + "|\r")

         basic.showIcon(IconNames.Yes)
       
   }
   /**
     * This is an MQTT listener callback function, which is very important.
     * The specific use method can refer to "example/ObloqMqtt.ts"
    */
    //% weight=100
    //% blockGap=50
    //% mutate=objectdestructuring
    //% mutateText=PacketaMqtt
    //% mutateDefaults="message:message"
    //% blockId=obloq_mqtt_callback_user block="on topic_0 received"
    export function Obloq_mqtt_callback_user(cb: (packet: PacketaMqtt) => void): void {
        Obloq_mqtt_callback(() => {
            const packet = new PacketaMqtt()
            packet.topic = OBLOQ_ANSWER_CMD
            packet.message = OBLOQ_ANSWER_CONTENT
            cb(packet)
        });
    }

    /**
     * This is an MQTT listener callback function, which is very important.
     * The specific use method can refer to "example/ObloqMqtt.ts"
    */
    //% weight=180
    //% blockGap=60
    //% mutate=objectdestructuring
    //% mutateText=PacketaMqtt
    //% mutateDefaults="message:message"
    //% blockId=obloq_mqtt_callback_user_more block="on %top |received"
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    //% advanced=true
    export function Obloq_mqtt_callback_user_more(top: TOPIC, cb: (packet: PacketaMqtt) => void) {
        Obloq_mqtt_callback_more(top, () => {
            const packet = new PacketaMqtt()
            packet.topic = OBLOQ_ANSWER_CMD
            packet.message = OBLOQ_ANSWER_CONTENT
            cb(packet)
        }); 
    }


    function Obloq_serial_recevice(): void {
        let size = obloqRxBufferedSize()
        //serial.writeNumber(size)
        if (size <= 5) return
        let item = obloqreadString(size)
        //if (size > 10) {serial.writeString(item) }
        for (let i = 0; i < size; i++) {
            if (item.charAt(i) == '|') {
                continue
                /////////////////////////////////////System api////////////////////////////////////////
            } else if (item.charAt(i) == '1') {
                if (item.charAt(i + 1) == '|') {
                    if (item.charAt(i + 2) == '1') { //|1|1|
                        OBLOQ_ANSWER_CMD = "PingOk"
                        OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                        return
                    } else if (item.charAt(i + 2) == '2') { //|1|2|version|
                        let z = 0
                        let j = i + 4
                        for (i = i + 4; i < size; i++) {
                            if (item.charAt(i) == '|') {
                                break;
                            } else {
                                z = z + 1
                            }
                        }
                        OBLOQ_ANSWER_CMD = "GetVersion"
                        OBLOQ_ANSWER_CONTENT = item.substr(j, z)//version
                        return
                    } else if (item.charAt(i + 2) == '3') { //|1|3|
                        if (OBLOQ_MQTT_INIT) {
                            OBLOQ_ANSWER_CMD = "Heartbeat"
                            OBLOQ_ANSWER_CONTENT = "OK"
                        }
                        return
                    }
                }
/////////////////////////////////////Wifi api////////////////////////////////////////
            } else if (item.charAt(i) == '2') {
                if (item.charAt(i + 1) == '|') {
                    if (item.charAt(i + 2) == '1') { //|2|1|
                        OBLOQ_ANSWER_CMD = "WifiDisconnect"
                        OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                        if (OBLOQ_MQTT_INIT || OBLOQ_HTTP_INIT || OBLOQ_WIFI_CONNECTED) {
                            OBLOQ_WRONG_TYPE = "wifi disconnect"
                        }
                        return
                    } else if (item.charAt(i + 2) == '2') { //|2|2|
                        OBLOQ_ANSWER_CMD = "WifiConnecting"
                        OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                        return
                    }else if (item.charAt(i + 2) == '3') { //|2|3|ip|
                        let z = 0
                        let j = i + 4
                        for (i = i + 4; i < size; i++) {
                            if (item.charAt(i) == '|') {
                                break;
                            } else {
                                z = z + 1
                            }
                        }
                        OBLOQ_ANSWER_CMD = "WifiConnected"
                        OBLOQ_ANSWER_CONTENT = item.substr(j, z)//IP addr
                        return
                    } else if (item.charAt(i + 2) == '4') { //|2|4|
                        OBLOQ_ANSWER_CMD = "WifiConnectFailure"
                        OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                        return
                    }
                }
/////////////////////////////////////Http api////////////////////////////////////////
            } else if (item.charAt(i) == '3') {
                if (item.charAt(i + 1) == '|') { //|3|errcode|message|
                    let z = 0
                    let j = i + 2
                    for (i = i + 2; i < size; i++) {
                        if (item.charAt(i) == '|') {
                            break;
                        } else {
                            z = z + 1
                        }
                    }
                    OBLOQ_ANSWER_CMD = item.substr(j, z)
                    z = 0
                    j = i + 1
                    for (i = i + 1; i < size; i++) {
                        if (item.charAt(i) == '|') {
                            break;
                        } else {
                            z = z + 1
                        }
                    }
                    OBLOQ_ANSWER_CONTENT = item.substr(j, z)
                    return
                }
/////////////////////////////////////Mqtt api////////////////////////////////////////
            } else if (item.charAt(i) == '4') { // serial.writeNumber(2);
                if (item.charAt(i + 1) == '|') {
                    if (item.charAt(i + 2) == '1') {   //|4|1|1|1|
                        if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '1' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "MqttConneted"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '1' && //|4|1|1|2|reason|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|'
                        ) { 
                            OBLOQ_ANSWER_CMD = "MqttConnectFailure"
                            let z = 0
                            let j = i + 8
                            for (i = i + 8; i < size; i++) {
                                if (item.charAt(i) == '|') {
                                    break;
                                } else {
                                    z = z + 1
                                }
                            }
                            OBLOQ_ANSWER_CONTENT = item.substr(j, z)
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '2' && //|4|1|2|1|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "SubOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '2' && //|4|1|2|2|1|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|' &&
                            item.charAt(i + 8) == '1' &&
                            item.charAt(i + 9) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "SubCeiling"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '2' && //|4|1|2|2|2|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|' &&
                            item.charAt(i + 8) == '2' &&
                            item.charAt(i + 9) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "SubFailure"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '3' && //|4|1|3|1|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {  //led.plot(0, 1)
                            OBLOQ_ANSWER_CMD = "PulishOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '3' && //|4|1|3|2|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|'
                        ) {  //led.plot(0, 1)
                            OBLOQ_ANSWER_CMD = "PulishFailure"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            OBLOQ_WRONG_TYPE = "mqtt pulish failure"
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '4' && //|4|1|4|1|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "MqttDisconnected"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '4' && //|4|1|4|2|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "MqttDisconnectFailure"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '5' && //|4|1|5|
                            item.charAt(i + 5) == '|'
                        ) {
                            let z = 0
                            let j = i + 6
                            for (i = i + 6; i < size; i++) {
                                if (item.charAt(i) == '|') {
                                    break;
                                } else {
                                    z = z + 1
                                }
                            }
                            OBLOQ_ANSWER_CMD = item.substr(j, z)
                            z = 0
                            j = i + 1
                            for (i = i + 1; i < size; i++) {
                                if (item.charAt(i) == '|') {
                                    break;
                                } else {
                                    z = z + 1
                                }
                            }
                            OBLOQ_ANSWER_CONTENT = item.substr(j, z)///?????????
                            switch (OBLOQ_ANSWER_CMD) { 
                                case OBLOQ_MQTT_TOPIC[0][0]: { if(OBLOQ_MQTT_CB[0] != null ) obloqforevers(OBLOQ_MQTT_CB[0]); } break;
                                case OBLOQ_MQTT_TOPIC[1][0]: { if(OBLOQ_MQTT_CB[1] != null ) obloqforevers(OBLOQ_MQTT_CB[1]); } break;
                                case OBLOQ_MQTT_TOPIC[2][0]: { if(OBLOQ_MQTT_CB[2] != null ) obloqforevers(OBLOQ_MQTT_CB[2]); } break;
                                case OBLOQ_MQTT_TOPIC[3][0]: { if(OBLOQ_MQTT_CB[3] != null ) obloqforevers(OBLOQ_MQTT_CB[3]); } break;
                                case OBLOQ_MQTT_TOPIC[4][0]: { if(OBLOQ_MQTT_CB[4] != null ) obloqforevers(OBLOQ_MQTT_CB[4]); } break;
                            }
                            break
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '6' && //|4|1|6|1|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "UnSubOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '6' && //|4|1|6|2|1|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|' &&
                            item.charAt(i + 8) == '1' &&
                            item.charAt(i + 9) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "UnSubFailure"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&
                            item.charAt(i + 4) == '6' && //|4|1|6|2|2|
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|' &&
                            item.charAt(i + 8) == '2' &&
                            item.charAt(i + 9) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "UnSubFailure"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        }
/////////////////////////////////////Azure api////////////////////////////////////////
                    } else if (item.charAt(i + 2) == '2') {
                        if (item.charAt(i + 3) == '|' &&  //|4|2|1|1|
                            item.charAt(i + 4) == '1' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureCredentialCreatOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|1|2|reason|
                            item.charAt(i + 4) == '1' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureCredentialCreateFailure"
                            let z = 0
                            let j = i + 8
                            for (i = i + 8; i < size; i++) {
                                if (item.charAt(i) == '|') {
                                    break;
                                } else {
                                    z = z + 1
                                }
                            }
                            OBLOQ_ANSWER_CONTENT = item.substr(j, z)
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|2|1|
                            item.charAt(i + 4) == '2' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureListenOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|3|1|
                            item.charAt(i + 4) == '3' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureSendOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|3|2|
                            item.charAt(i + 4) == '3' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = OBLOQ_STR_TYPE_IS_NONE
                            OBLOQ_ANSWER_CONTENT = "AzureSendFailure"
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|4|1|
                            item.charAt(i + 4) == '4' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureDestructionOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|4|2|
                            item.charAt(i + 4) == '4' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '2' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureDestructionFailure"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|5|message|
                            item.charAt(i + 4) == '5' &&
                            item.charAt(i + 5) == '|' 
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureReceiveOk"
                            let z = 0
                            let j = i + 6
                            for (i = i + 6; i < size; i++) {
                                if (item.charAt(i) == '|') {
                                    break;
                                } else {
                                    z = z + 1
                                }
                            }
                            OBLOQ_ANSWER_CONTENT = item.substr(j, z)
                            return
                        } else if (item.charAt(i + 3) == '|' &&  //|4|2|6|1|
                            item.charAt(i + 4) == '6' &&
                            item.charAt(i + 5) == '|' &&
                            item.charAt(i + 6) == '1' &&
                            item.charAt(i + 7) == '|'
                        ) {
                            OBLOQ_ANSWER_CMD = "AzureUnSubOk"
                            OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                            return
                        }
                    }
                }
            } else if (item.charAt(i) == 't') {
                if (item.charAt(i + 1) == 'i' &&
                    item.charAt(i + 2) == 'm' &&
                    item.charAt(i + 3) == 'e' &&
                    item.charAt(i + 4) == 'o' &&
                    item.charAt(i + 5) == 'u' &&
                    item.charAt(i + 6) == 't'
                ) {
                    OBLOQ_ANSWER_CMD = "timeout"
                    OBLOQ_ANSWER_CONTENT = OBLOQ_STR_TYPE_IS_NONE
                    return
                }
            }
        }
        //serial.writeNumber(n);
        //serial.writeString("\r\n");
    }

    function onEvent() {
        if (!OBLOQ_SERIAL_INIT) { 
            Obloq_serial_init()
        }
        OBLOQ_MQTT_EVENT = OBLOQ_BOOL_TYPE_IS_TRUE
        //obloqClearRxBuffer()
        //obloqClearTxBuffer()
        //obloqEventAfter(1)
        obloqEventOn("\r")
        control.onEvent(<number>32, <number>1, Obloq_serial_recevice); // register handler
    }


	
	
}