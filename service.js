// nj 原生模組
const http = require("http");

// 外部套件
const { v4: uuidv4 } = require("uuid");

// 自己寫的模組
const errorHandle = require("./errorHandle");

// 清單資料，會存在 npm 記憶體，關掉才會更新
let todos = [];

const requestListener = (req, res) => {
    console.log(req.url);
    console.log(req.method);
    const headers = {
        "Access-Control-Allow-Headers":
            "Content-Type, Authorization, Content-Length, X-Requested-With",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
        "Content-Type": "application/json",
    };

    // 接收對方傳來的東西
    let body = "";
    req.on("data", (chunk) => {
        // console.log(chunk);
        body += chunk;
    });

    // 測試驗證是否從指定 {網址來源}'(例如首頁)，以及請求 method
    // GET
    // 設定路由
    if (req.url == "/todos" && req.method == "GET") {
        res.writeHead(200, headers);
        res.write(
            JSON.stringify({
                status: "success",
                data: todos,
            }),
        );
        res.end();
        // POST
    } else if (req.url == "/todos" && req.method == "POST") {
        // 接收結束之後解析
        req.on("end", () => {
            // 避免吃到錯誤格式導致程式崩潰，要寫 try catch 結構
            try {
                // console.log(JSON.parse(body).title);
                const title = JSON.parse(body).title;
                // 先檢查是否有關鍵欄位，成功才可以寫入資料
                if (title !== undefined) {
                    // console.log(title);
                    const todo = {
                        title: title,
                        id: uuidv4(),
                    };
                    // console.log("目前的 todos 清單 = ", todos);
                    // console.log("準備寫入的 todo 物件=", todo);

                    todos.push(todo);
                    // console.log("寫入後的 todos 清單 = ", todos);
                    res.writeHead(200, headers);
                    res.write(
                        JSON.stringify({
                            status: "success",
                            data: todos,
                        }),
                    );
                    res.end();
                } else {
                    // JSON Parse 有成功，但缺少關鍵欄位
                    console.log("title = ", title);
                    const errorMessage = "唷同學，缺少 title 欄位";
                    errorHandle(res, errorMessage);
                }
            } catch (error) {
                // console.log("程式錯誤，原因：", error);
                // 錯誤要回傳 400 代碼，不能回傳 200
                const errorMessage = "唷同學，欄位未填寫正確，或無此 todo id";
                errorHandle(res, errorMessage);
            }
        });

        // DELETE
    } else if (req.url == "/todos" && req.method == "DELETE") {
        res.writeHead(200, headers);
        // 清空 todos 陣列
        todos.length = 0;
        res.write(
            JSON.stringify({
                status: "success",
                data: todos,
            }),
        );
        res.end();
    } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
        // 取得 id
        // const id = req.url.split("/")[req.url.split("/").length - 1];
        const id = req.url.split("/").pop();
        // 找到指定 id 的 index
        const index = todos.findIndex((element) => element.id == id);
        // console.log("index = ", index);
        // console.log("id = ", id);
        // 確保真的存在 id 才刪除
        if (index !== -1) {
            todos.splice(index, 1);
            res.writeHead(200, headers);
            res.write(
                JSON.stringify({
                    status: "success",
                    data: todos,
                }),
            );
            res.end();
        } else {
            const errorMessage = "查無此代辦 id";
            errorHandle(res, errorMessage);
            res.end();
        }
    } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
        // PATCH 更新資料
        // 接收結束之後解析
        req.on("end", () => {
            // 避免吃到錯誤格式導致程式崩潰，要寫 try catch 結構

            try {
                // 先確認是否有戴 title 屬性
                const todo = JSON.parse(body).title;
                console.log("有檢察 title");
                if (todo !== undefined && todo.length > 0) {
                    // 解析 id 與 index
                    const id = req.url.split("/").pop();
                    const index = todos.findIndex(
                        (element) => element.id == id,
                    );
                    console.log("id = ", id);
                    console.log("index = ", index);

                    // 檢查 id 是否存在
                    if (index !== -1) {
                        // 如果 id 存在，舊更新
                        todos[index].title = todo;
                        res.writeHead(200, headers);
                        res.write(
                            JSON.stringify({
                                status: "success",
                                data: todos,
                            }),
                        );
                        res.end();
                    } else {
                        // id 不存在
                        const errorMessage = "查無此代辦 id 阿~~";
                        errorHandle(res, errorMessage);
                    }
                } else {
                    console.log("title 錯誤");
                    const errorMessage = "title 填寫錯誤或未填寫";
                    errorHandle(res, errorMessage);
                }
            } catch (error) {
                console.log("沒有檢察 title");
                const errorMessage = "request 格式錯誤";
                errorHandle(res, errorMessage);
            }
        });
    } else if (req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    } else {
        const errorMessage = "查無此路由，滾蛋";
        errorHandle(res, errorMessage);
    }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
