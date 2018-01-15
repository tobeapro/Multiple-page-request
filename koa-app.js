const koa=require('koa')
const timeout=require('koa-timeout')(1000000)
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
app.use(timeout)
app.use((ctx,next)=>{
	ctx.status=200
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
			ctx.body=infoData
			console.log(infoData)
			console.timeEnd('requestTime')						
		})
		.catch((erro)=>{
			ctx.body=erro
		})
	})
})
app.listen(port,()=>{
	console.log('koa-app listen on port:'+port)
})