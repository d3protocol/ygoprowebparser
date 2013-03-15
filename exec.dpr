program exec;

{$APPTYPE CONSOLE}

uses
  windows,SysUtils,Classes,Contnrs, StrUtils,forms,Dialogs,shellapi;


  procedure EnumFileInQueue(path: PChar; fileExt: string; fileList: TStringList);

var 
   searchRec: TSearchRec;
   found: Integer;
   tmpStr: string;
   curDir: string;
   dirs: TQueue;
   pszDir: PChar;

begin

   dirs := TQueue.Create; //创建目录队列
   dirs.Push(path); //将起始搜索路径入队
   pszDir := dirs.Pop;
   curDir := StrPas(pszDir); //出队
   {开始遍历,直至队列为空(即没有目录需要遍历)}
   while (True) do
   begin
      //加上搜索后缀,得到类似'c:\*.*' 、'c:\windows\*.*'的搜索路径
      tmpStr := curDir + '\*.*';
      //在当前目录查找第一个文件、子目录
      found := FindFirst(tmpStr, faAnyFile, searchRec);
      while found = 0 do //找到了一个文件或目录后
      begin
          //如果找到的是个目录
         if (searchRec.Attr and faDirectory) <> 0 then
         begin
          {在搜索非根目录(C:\、D:\)下的子目录时会出现'.','..'的"虚拟目录"
          大概是表示上层目录和下层目录吧。。。要过滤掉才可以}
            if (searchRec.Name <> '.') and (searchRec.Name <> '..') then
            begin
               {由于查找到的子目录只有个目录名，所以要添上上层目录的路径
                searchRec.Name = 'Windows';
                tmpStr:='c:\Windows';
                加个断点就一清二楚了
               }
               tmpStr := curDir + '\' + searchRec.Name;
               {将搜索到的目录入队。让它先晾着。
                因为TQueue里面的数据只能是指针,所以要把string转换为PChar
                同时使用StrNew函数重新申请一个空间存入数据，否则会使已经进
                入队列的指针指向不存在或不正确的数据(tmpStr是局部变量)。}
               dirs.Push(StrNew(PChar(tmpStr)));
            end;
         end
         else //如果找到的是个文件
         begin
             {Result记录着搜索到的文件数。可是我是用CreateThread创建线程
              来调用函数的，不知道怎么得到这个返回值。。。我不想用全局变量}
            //把找到的文件加到Memo控件
            if fileExt = '.*' then
               fileList.Add(curDir + '\' + searchRec.Name)
            else
            begin
               if SameText(RightStr(curDir + '\' + searchRec.Name, Length(fileExt)), fileExt) then
                  fileList.Add(curDir + '\' + searchRec.Name);
            end;
         end;
          //查找下一个文件或目录
         found := FindNext(searchRec);
      end;  
      {当前目录找到后，如果队列中没有数据，则表示全部找到了；
        否则就是还有子目录未查找，取一个出来继续查找。}
      if dirs.Count > 0 then
      begin
         pszDir := dirs.Pop;
         curDir := StrPas(pszDir);
         StrDispose(pszDir);
      end
      else
         break;
   end;
   //释放资源
   dirs.Free;
   FindClose(searchRec);

end;

   var dir: string;  
   i,j:integer;
   FileNameList: TStringList;
   exepath,exeparms:string;
   exedir:pchar;
   startupInfo :TStartupInfo;
  process:TProcessInformation;//exe进程信息
  newname:string;
begin 

  if paramstr(1)='' then exit;
   dir := trim(ExtractFilePath(Application.ExeName)+'replay');
   FileNameList := TStringList.Create;
   FileNameList.Add(ExtractFilePath(Application.ExeName)+paramstr(1));
   //EnumFileInQueue(PChar(dir), '.*', FileNameList);
   for i:=0 to FileNameList.Count-1 do
   begin
      try
       newname:=ExtractFileName(FileNameList[i]);
       writeln(FileNameList[i]);
       exepath:=pchar(ExtractFilePath(ParamStr(0))+'pro.exe');
       exeparms:=newname;
       writeln(exepath+' '+exeparms);
       exedir:=pchar(ExtractFilePath(ParamStr(0)));
       writeln(exedir);
       FillChar(startupInfo,sizeof(StartupInfo),0);

          //创建一个YGOCORE副本
          if CreateProcess(nil,pchar(exepath+' '+exeparms),Nil,Nil,True,CREATE_NO_WINDOW,Nil,exedir,startupInfo,process) then
          begin
            for j:=0 to 10000 do
            begin
              sleep(5);
            end;
          end;
          TerminateProcess(process.hProcess,0);
      finally
      end;
   end;
   FileNameList.Free;
end.
