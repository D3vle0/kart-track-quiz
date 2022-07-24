import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;
const jsonData = require('../public/track.json');

app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.render('index');
});

app.post('/', (req: Request, res: Response, next: NextFunction) => {
    var filter = ""; // 제외할 테마를 담는 배열
    if (!req.body.theme1) filter += "1920|";
    if (!req.body.theme2) filter += "WKC|"
    if (!req.body.theme3) filter += "공동묘지|"
    if (!req.body.theme4) filter += "광산|"
    if (!req.body.theme5) filter += "네모|"
    if (!req.body.theme6) filter += "노르테유|"
    if (!req.body.theme7) filter += "놀이동산|"
    if (!req.body.theme8) filter += "님프|"
    if (!req.body.theme9) filter += "대저택|"
    if (!req.body.theme10) filter += "도검|"
    if (!req.body.theme11) filter += "동화|"
    if (!req.body.theme12) filter += "마비노기|"
    if (!req.body.theme13) filter += "메카닉|"
    if (!req.body.theme14) filter += "문힐시티|"
    if (!req.body.theme15) filter += "브로디|"
    if (!req.body.theme16) filter += "비치|"
    if (!req.body.theme17) filter += "빌리지|"
    if (!req.body.theme18) filter += "사막|"
    if (!req.body.theme19) filter += "신화|"
    if (!req.body.theme20) filter += "아이스|"
    if (!req.body.theme21) filter += "어비스|"
    if (!req.body.theme22) filter += "올림포스|"
    if (!req.body.theme23) filter += "월드|"
    if (!req.body.theme24) filter += "쥐라기|"
    if (!req.body.theme25) filter += "차이나|"
    if (!req.body.theme26) filter += "카멜롯|"
    if (!req.body.theme27) filter += "코리아|"
    if (!req.body.theme28) filter += "팩토리|"
    if (!req.body.theme29) filter += "포레스트|"
    if (!req.body.theme30) filter += "해적|"
    if (!req.body.theme31) filter += "황금문명|";
    // console.log(filter);
    var result: any = [];
    while (1) {
        if (result.length == 10) break;
        var rand = Math.floor(Math.random() * jsonData.length);
        if (filter == "") {
            result.push(jsonData[rand]);
        }
        else {
            if (jsonData[rand]["name"].indexOf(filter) == -1) {
                result.push(jsonData[rand]);
            }
        }
    }
    // console.log(result);
    var answer = [];
    for (var i = 0; i < result.length; i++) {
        answer.push(result[i]["name"]);
    }
    console.log(answer);
    fs.writeFile("temp.json", JSON.stringify(answer), function (err) {
        if (err) throw err;
        console.log('complete');
        res.render('game', { res: result });
    }
    );
});

app.post('/submit', (req: Request, res: Response, next: NextFunction) => {
    // const answerData = require('../temp.json');
    const temp = fs.readFileSync("temp.json", { encoding: 'utf-8', flag: 'r' });
    const answerData = JSON.parse(temp);
    console.log(answerData);
    // console.log(req.body);
    var arr = Object.values(req.body);
    console.log(arr);
    var gameResult = 0;
    for (var i = 0; i < arr.length / 2; i++) {
        if (arr[i * 2 + 1] == answerData[i]) { // 1
            gameResult += 1;
        }
    }
    console.log(gameResult)
    res.render('result', { result: gameResult * 10 });
    // if (req.body.input0 == jsonData[]["name"])
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
