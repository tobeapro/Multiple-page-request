const koa=require('koa')
const route=require('koa-route')
const timeout=require('koa-timeout')(100000)
const agent=require('superagent')
const cheerio=require('cheerio')
const port=8088
const app=new koa()
function requestInfo(URL){
	return new Promise((resolve,reject)=>{
		agent.get(URL)
		.end((err,data)=>{
			if(err){
				reject(err)
			}
			resolve(data)
		})
	})
}

app.use(route.get('/',(ctx,next)=>{
	console.time('requestTime')
	agent.get('http://www.casad.cas.cn/chnl/371/index.html')
	.end((err,data)=>{
		if(err){
			next(err)
		}
		let $=cheerio.load(data.text)
		allLink=$("#allNameBar a")
		let allUrl=[]
		allLink.each((index,item)=>{
			if(index<3){
				return
			}else{
				let url=$(item).attr('href')
				allUrl.push(requestInfo(url))
			}	
		})
		allUrl=allUrl.slice(0,10)	
		Promise.all(allUrl)
		.then((pages)=>{
			let infoData=[]
			pages.forEach((html)=>{
				let $=cheerio.load(html.text)
				let info={}
				let name=$('.contentBar .title h1').text()
				info.name=name
				let intro=$("#zoom p")		
				info.intro=intro.text()				
				infoData.push(info)
			})
			console.timeEnd('requestTime')
			ctx.body=infoData
			
		})
		.catch((erro)=>{
			ctx.body=erro
		})
	})
}))
// const main = async function(ctx) {
//   const tmpdir = os.tmpdir();
//   const filePaths = [];
//   const files = ctx.request.body.files || {};

//   for (let key in files) {
//     const file = files[key];
//     const filePath = path.join(tmpdir, file.name);
//     const reader = fs.createReadStream(file.path);
//     const writer = fs.createWriteStream(filePath);
//     reader.pipe(writer);
//     filePaths.push(filePath);
//   }

//   ctx.body = filePaths;
// };

// app.use(koaBody({ multipart: true }));
// app.use(main);
app.listen(port,()=>{
	console.log('koa-app listen on port:'+port)
})