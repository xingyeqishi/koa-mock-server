const Koa = require('koa');
const path = require('path');
const fs = require('fs-extra');
const fileExists = require('file-exists');
const axios = require('axios');
const app = new Koa();

// response
app.use(async ctx => {
	const url = ctx.request.url;
    let resource = ctx.request.query.resource || null;
    let pathArr = url.split('?')[0].split('/').filter(item => item !== "");
    if (resource) {
        let filePath = path.join(__dirname, '/data', pathArr.join('/'), resource);
        const isExist = await fileExists(filePath)
        if (isExist) {
            console.log('命中缓存:' + url)
            ctx.body = fs.readFileSync(filePath).toString();
            return;
        } else {
						let result = await axios.request({
								 url: "https://x.threatbook.cn" + url,
								 method: "get"
						});
            if (result.data.response_code === 0) {
                console.log('回源获取:' + url);
                await fs.ensureFile(filePath);
                fs.writeFileSync(filePath, JSON.stringify(result.data));
                ctx.body = result.data;
                return;
            }
        }
    } else {
        try {
            await fs.ensureDir(path.join(__dirname, '/data', pathArr.join('/')));
            console.log('directory exist');
        } catch(e) {
            console.log('directory not exist');
        }
    }

  ctx.body = 'Hello Koa';
});

app.listen(3000);
