<!--#include file="upload_class.asp"-->
<%
Dim Upload,path,tempCls,e
'===============================================================================
'创建类实例
set Upload=new AnUpLoad	

'设置单个文件最大上传限制,按字节计；默认为不限制
Upload.SingleSize=clng(1000 * 1024) * 1024 

'设置最大上传限制,按字节计；默认为不限制
Upload.MaxSize=clng(1000 * 1024) * 1024 

'设置合法扩展名,以|分割,忽略大小写
Upload.Exe="*.yrp;" 

'设置文本编码，默认为gb2312
Upload.Charset="utf-8"	

'获取并保存数据,必须调用本方法
Upload.GetData() 
'===============================================================================
'判断错误号,如果myupload.Err<=0表示正常

Function RndNumber(MaxNum,MinNum)
Randomize 
RndNumber=int((MaxNum-MinNum+1)*rnd+MinNum)
RndNumber=RndNumber
End Function

x=Now()
 xx  = Month(x) & Day(x) &hour(x)&minute(x) &second(x) &RndNumber(3000,1000)

if Upload.ErrorID>0 then
	response.Write("{err:true,msg:'" & Upload.description & "'}")
else
	if Upload.files(-1).count>0 then '这里判断你是否选择了文件
		path=server.mappath("replay")
		set tempCls=Upload.files("filedata") 
		tempCls.NewName= xx&".yrp"
		if tempCls.isfile then
			if tempCls.SaveToFile(path,0,true) then
				Set server_shell = Server.CreateObject("wscript.shell")
				server_shell.Run "D:\ygoserver\newserver\swfupload\swfupload\exec.exe "&tempCls.filename,0
				response.Write("{err:false,msg:'upload',name:'" & replace(tempCls.filename," ","") & "',src:'" & tempCls.LocalName & "'}")
			else
				response.Write("{err:true,msg:'" & tempCls.Exception & "'}")
			end if
		else
			response.Write("{err:true,msg:'文件表单丢失'}")
		end if

		set tempCls=nothing
	end if
end if
set Upload=nothing
%>
