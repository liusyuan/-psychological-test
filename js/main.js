/**
 * Created by CM on 2016/5/21.
 */
AV.initialize(appId, appKey);
var Paper = AV.Object.extend('Paper');
var Question = AV.Object.extend("Question");
var Consequence = AV.Object.extend("Consequence");
var Doctor = AV.Object.extend('Doctor');
var currentDoctor = "";
var strResults = "";
var tempPaper;
var temp1 = new Array();
/********************************************/
function iD(id) {
    return document.getElementById(id);
}
function nAME(name) {
    return document.getElementsByName(name);
}
function addNODE(obj) {
    return document.createElement(obj);
}
function getCurrentDoctor() {
    var queryDoctor = new AV.Query("Doctor");
    queryDoctor.equalTo("account", AV.User.current());
    queryDoctor.first().then(function (temp) {
        currentDoctor = temp;
    });
}
function getSelect(obj) {
    return tempPaper[obj.selectedIndex];
}
function nullNotNeed() {
    iD("two").style.display = "none";
    iD("p1").style.display = "none";
    iD("th").innerHTML = "";
    iD("tbo").innerHTML = '';
    iD("p1").innerHTML = "";
    strResults = "";
}
/********************************************/
function isLogIn() {
    nullNotNeed();
    if (AV.User.current()) {
        logedPage();
    } else {
        nologedPage();
    }
}
function login() {
    var u = iD('uid').value.trim();
    var p = iD('pwd').value.trim();
    if (u == "" || p == "") {
        alert("用户名密码不能为空");
    } else {
        AV.User.logIn(u, p).then(function () {
            var queryD=new AV.Query("Doctor");
            queryD.equalTo("account",AV.User.current());
            queryD.first().then(function (res) {
                if(res){
                    alert('登陆成功！关闭前请注意"退出"');
                    logedPage();
                }else {
                    AV.User.logOut();
                    alert("登陆失败，只有医生用户才能登陆网页端");
                }
            });
        }, function (error) {
            switch (error.code){
                case 211:alert("用户名错误！");
                    break;
                case 210:alert("密码错误！");
                    break;
            }
            console.log("logIn Defeat");
            console.log('Error: ' + error.code + ' ' + error.message);
        })
    }
}
function logOut() {
    if (confirm("确定退出？")) {
        AV.User.logOut();
        nologedPage();
    }
}
/********************************************/
function seeResults(tb, beg, end, paper) {
    if (end.trim() == '' || beg.trim() == '') {
        alert("必选项不能为空!");
    } else {
        var a = new Date(beg + ' 00:00:00'), b = new Date(end + ' 23:59:59');
        if (b.getTime() >= a.getTime()) {
            iD("tjylBtn").disabled = true;
            nullNotNeed();
            querySee(tb, a, b, paper);
        } else {
            alert("开始时间不能大于结束时间!");
        }
    }
}
function querySee(tb, begindate, enddate, paper) {
    var queryGR = new AV.Query("GeneralRecord");
    queryGR.equalTo("paper", paper);
    queryGR.greaterThanOrEqualTo('createdAt', begindate);
    queryGR.lessThanOrEqualTo('createdAt', enddate);
    queryGR.include("user");
    queryGR.addAscending("user");
    queryGR.addDescending("createdAt");
    queryGR.find().then(function (gRecords) {
        if (gRecords && gRecords.length) {
            drawThead(tb, null, 0);
            drawTbody(tb, gRecords, null, 0);
            iD("down").disabled = false;
        } else {
            alert("没有符合条件的结果！");
        }
    });
}
function downResults(tb, beg, end, paper) {
    if (end.trim() == '' || beg.trim() == '') {
        alert("必选项不能为空!");
    } else {
        var a = new Date(beg + ' 00:00:00'), b = new Date(end + ' 23:59:59');
        if (b.getTime() >= a.getTime()) {
            iD("down").disabled = true;
            nullNotNeed();
            queryRESULTS(tb, a, b, paper);
        } else {
            alert("开始时间不能大于结束时间!");
        }
    }
}
function queryRESULTS(tb, begindate, enddate, paper) {
    var queryGR = new AV.Query("GeneralRecord");
    queryGR.equalTo("paper", paper);
    queryGR.greaterThanOrEqualTo('createdAt', begindate);
    queryGR.lessThanOrEqualTo('createdAt', enddate);
    queryGR.include("cons");
    queryGR.addAscending("user");
    queryGR.addDescending("createdAt");
    queryGR.find().then(function (gRecords) {
        var query = new AV.Query('DetailRecord');
        query.greaterThanOrEqualTo('createdAt', begindate);
        query.lessThanOrEqualTo('createdAt', enddate);
        query.equalTo('paper', paper);
        query.include("question", "user");
        query.addAscending("user");
        query.addDescending("createdAt");
        query.addAscending("question");
        var aques = new AV.Query('Question');
        aques.equalTo('paper', paper);
        aques.addAscending("objectId");
        aques.find().then(function (questions) {
            var num = questions.length;
            drawThead(tb, questions, num);
            query.find().then(function (results) {
                drawTbody(tb, gRecords, results, num);
            }, function (error) {
                console.log("DetailRecord query Defeat");
                console.log('Error: ' + error.code + ' ' + error.message);
            });
        }, function (error) {
            console.log("Question query Defeat");
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    });
}
function drawThead(tb, questions, num) {
    var tr = addNODE("tr");
    var th = addNODE("th");
    th.innerHTML = '姓名';
    tr.appendChild(th);
    if (num > 0) {
        strResults += '姓名' + ",";
        for (var i = 0; i < num; i++) {
            th = addNODE("th");
            th.innerHTML = questions[i].get("text");
            strResults += questions[i].get("text") + ',';
            tr.appendChild(th);
        }
        th = addNODE("th");
        th.innerHTML = "结果（分数/描述）";
        tr.appendChild(th);
        strResults += "结果（分数/描述）" + ",";
        strResults += "做题时间" + "\r\n";
    }
    th = addNODE("th");
    th.innerHTML = "做题时间";
    tr.appendChild(th);
    tb.tHead.appendChild(tr);
}
function drawTbody(tb, gRecords, results, num) {
    var td, tr, ans, un, t;
    if (num > 0) {
        for (var i = 0, j = 0; i < results.length; i++) {
            if (i % num == 0) {
                tr = addNODE("tr");
                td = addNODE("td");
                un = results[i].get('user').get("username");
                td.innerHTML = un;
                strResults += td.innerHTML + ",";
                tr.appendChild(td);
            }
            t = results[i].get('question');
            ans = results[i].get("answer");
            td = addNODE("td");
            td.innerHTML = t.get('option' + ans) + '/' + t.get('grade' + ans);
            strResults += t.get('option' + ans) + '/' + t.get('grade' + ans) + ",";
            tr.appendChild(td);
            if ((i + 1) % num == 0) {
                td = addNODE("td");
                td.innerHTML = gRecords[j].get("grade") + '/' + gRecords[j].get("cons").get("detail");
                tr.appendChild(td);
                strResults += td.innerHTML + ",";
                td = addNODE("td");
                td.innerHTML = gRecords[j].getCreatedAt().toLocaleString();
                tr.appendChild(td);
                strResults += td.innerHTML + "\r\n";
                j++;
                tb.lastElementChild.appendChild(tr);
            }
        }
        saveExcel();
    } else {
        for (var i = 0; i < gRecords.length; i++) {
            tr = addNODE("tr");
            td = addNODE("td");
            td.innerHTML = gRecords[i].get("user").get("username");
            tr.appendChild(td);
            td = addNODE("td");
            td.innerHTML = gRecords[i].getCreatedAt().toLocaleString();
            tr.appendChild(td);
            tb.lastElementChild.appendChild(tr);
        }
    }
    Highlight();
    iD("two").style.display = "block";
}
function saveExcel() {
    var BB = self.Blob;
    saveAs(new BB(["\ufeff" + strResults], {type: "text/plain;charset=utf8"}), new Date().toLocaleString() + ".csv");
}
/********************************************/
function checks(name) {
    var radios = (nAME(name));
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked == true) {
            return radios[i].value;
        }
    }
}
function commitScalePage() {
    if (confirm("确定上传？")) {
        queryCommitScalePage(iD("tbname").value.trim(), iD("detail").value.trim(), checks("r1"));
    }
}
function queryCommitScalePage(papername, detail, type) {
    var query1 = new AV.Query("Paper");
    query1.equalTo("name", papername);
    query1.find().then(function (result1) {
        if (result1&&result1.length) {
            alert("表名重名了！！已存在该名称的表，请修改表名");
        } else {
            var paper = new Paper();
            if (type == 1 && currentDoctor != "") {
                paper.set("doctor", currentDoctor);
            }
            paper.set("name", papername);
            paper.set("detail", detail);
            var pArr = iD("p1").getElementsByTagName("input");
            var consequences = new Array();
            for (i = 0; i < (pArr.length / 3); i++) {
                if (pArr[i * 3].value.trim() != "") {
                    consequences[i] = new Consequence();
                    consequences[i].set("paper", paper);
                    consequences[i].set("minGrade", Number(pArr[i * 3].value));
                    consequences[i].set("maxGrade", Number(pArr[i * 3 + 1].value));
                    consequences[i].set("detail", pArr[i * 3 + 2].value.trim());
                } else {
                    break;
                }
            }
            AV.Object.saveAll(consequences).then(function () {
                console.log("Consequences Save Success");
            }, function (error) {
                console.log("Consequences Save Defeat");
                console.log('Error: ' + error.code + ' ' + error.message);
            });
            var trs = iD("tbo").getElementsByTagName("tr");
            var questions = new Array();
            for (var i = 0; i < trs.length; i++) {
                var tds = trs[i].getElementsByTagName("td");
                var tdstxt = tds[0].innerHTML.trim();
                if (tdstxt != "") {
                    questions[i] = new Question();
                    questions[i].set("text", tdstxt);
                    questions[i].set("paper", paper);
                    for (var j = 1; j < tds.length - 1; j++) {
                        var tdstp = tds[j].innerHTML.trim();
                        if (tdstp != "") {
                            var tp, txt;
                            switch (j) {
                                case 1:
                                    tp = "optionA";
                                    txt = tdstp;
                                    break;
                                case 2:
                                    tp = "gradeA";
                                    txt = Number(tdstp);
                                    break;
                                case 3:
                                    tp = "optionB";
                                    txt = tdstp;
                                    break;
                                case 4:
                                    tp = "gradeB";
                                    txt = Number(tdstp);
                                    break;
                                case 5:
                                    tp = "optionC";
                                    txt = tdstp;
                                    break;
                                case 6:
                                    tp = "gradeC";
                                    txt = Number(tdstp);
                                    break;
                                case 7:
                                    tp = "optionD";
                                    txt = tdstp;
                                    break;
                                case 8:
                                    tp = "gradeD";
                                    txt = Number(tdstp);
                                    break;
                                default:
                                    break;
                            }
                            questions[i].set(tp, txt);
                        } else {
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
            AV.Object.saveAll(questions).then(function () {
                console.log("Questions Save Success");
            }, function (error) {
                console.log("Questions Save Defeat");
                console.log('Error: ' + error.code + ' ' + error.message);
            });
        }
    });
}
/********************************************/
function isEmail(email) {
    var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return reg.test(email);
}
function isPhoneNumber(number) {
    var yidong = /^1(3[4-9]|5[012789]|8[23478]|4[7]|7[8])\d{8}$/;
    var liantong = /^1(3[0-2]|5[56]|8[56]|4[5]|7[6])\d{8}$/;
    var dianxin = /^1(3[3])|(8[019])\d{8}$/;
    return yidong.test(number) || liantong.test(number) || dianxin.test(number);
}
function register() {
    var register = iD("register").getElementsByTagName("input");
    for (var i = 0; i < register.length; i++) {
        temp1[i] = register[i].value.trim();
        if (temp1[i] == "") {
            alert("必选项不能为空");
            return;
        }
    }
    if (temp1[0].length < 4) {
        alert("账号不能少于4位");
        return;
    }
    if (temp1[1].length < 6) {
        alert("密码不能少于6位");
        return;
    }
    if (!isPhoneNumber(temp1[2])) {
        alert("手机号不合法");
        return;
    }
    if (!isEmail(temp1[3])) {
        alert("邮箱不合法");
        return;
    }
    iD("registerBtn").disabled = true;
    var account = new AV.User();
    account.setUsername(temp1[0]);
    account.setPassword(temp1[1]);
    account.setMobilePhoneNumber(temp1[2]);
    account.setEmail(temp1[3]);
    account.signUp().then(function (user) {
        temp1[1] = user;
        setDoctorRole(user);
    }, function (error) {
        console.log('Error: ' + error.code + ' ' + error.message);
    });
}
function setDoctorRole(user) {
    var query = new AV.Query(AV.Role);
    query.equalTo('name', 'doctor');
    query.first().then(function (role) {
        role.getUsers().add(user);
        role.save();
        alert("注册成功，请完善您的资料，以提供给用户更好的测评体验");
        editInfoPage();
    });
}
function saveDoctor() {
    var dt = iD("doctorinfo").getElementsByTagName("input");
    var d1 = new Array();
    for (var i = 0; i < dt.length - 1; i++) {
        d1[i] = dt[i].value.trim();
    }
    var doctor = new Doctor();
    var reg = /^(\d)+(\.\d{0,2})?$/;
    if (d1[0] != "") doctor.set('name', d1[0]);
    if (d1[1] != "")doctor.set('sex', d1[1]);
    if (d1[2] != "")doctor.set('address', d1[2]);
    if (reg.test(d1[3]))doctor.set('salary', Number(d1[3]));
    if (iD("intro").value.trim() != "")doctor.set('intro', iD("intro").value.trim());
    var f = iD("imgfile").files[0];
    if (f) {
        var imgf = new AV.File(f.name, f);
        doctor.set('picture', imgf);
    }
    doctor.set('phone', temp1[2]);
    doctor.set('email', temp1[3]);
    doctor.set('account', temp1[1]);
    doctor.save().then(function (result) {
        if (result != null) {
            alert('恭喜您,自动跳转到登陆后的界面,我们将记住您的登陆状态,需要退出请点击"退出"');
            isLogIn();
        }
    });
}
function viewImg() {
    var imgf = iD("imgfile");
    var f = imgf.files[0];
    if (f) {
        if (!(f.type == "image/jpeg" || f.type == "image/bmp" || f.type == "image/png")) {
            alert("必须是jpg/bmp/png图片");
            imgf.outerHTML = imgf.outerHTML;
            return;
        }
        if (f.size / 1024 > 1024) {
            alert("图片不能大于1M");
            imgf.outerHTML = imgf.outerHTML;
            return;
        }
        var img = iD("img");
        img.style.display = "block";
        img.src = window.URL.createObjectURL(f);
    }
}
/********************************************/
function editScale() {
    nullNotNeed();
    if (iD("tbname").value.trim() == "") {
        alert("必选项不能为空");
    } else {
        iD("editbtn").disabled = true;
        iD("temp1").disabled = false;
        iD("temp2").disabled = false;
        iD("temp3").disabled = false;
        addOneLine(iD("tb"), 9, 0);
        for (var i = 0; i < 3; i++) {
            addOneLine(iD("tb"), 9, 1);
        }
        addConsequenceLine();
        iD("two").style.display = "block";
        iD("p1").style.display = "block";
    }
}
function addConsequenceLine() {
    var p1 = iD("p1");
    var temp = addNODE("label");
    temp.innerHTML = "分数：";
    p1.appendChild(temp);
    temp = addNODE("input");
    temp.type = "text";
    temp.placeholder = "大于等于";
    p1.appendChild(temp);
    temp = addNODE("label");
    temp.innerHTML = "&nbsp到&nbsp";
    p1.appendChild(temp);
    temp = addNODE("input");
    temp.type = "text";
    temp.placeholder = "小于等于";
    p1.appendChild(temp);
    temp = addNODE("label");
    temp.innerHTML = "&nbsp结论：";
    p1.appendChild(temp);
    temp = addNODE("input");
    temp.type = "text";
    temp.style.width = "600px";
    temp.placeholder = "属于该分段的结论文本";
    p1.appendChild(temp);
    temp = addNODE("br");
    p1.appendChild(temp);
}
function addOneLine(tb, num, no) {
    if (no == 0) {
        var tbb = tb.tHead;
        var temp = "th";
        var tr = addNODE('tr');
        var arr1 = ["题目", "选项A", "分数A", "选项B", "分数B", "选项C", "分数C", "选项D", "分数D", "操作"];
        for (var i = 0; i < num; i++) {
            var td = addNODE(temp);
            td.innerHTML = arr1[i];
            tr.appendChild(td);
        }
        var td = addNODE(temp);
        td.innerHTML = arr1[arr1.length - 1];
        tr.appendChild(td);
        tbb.appendChild(tr);
    } else {
        var tbb = tb.lastElementChild;
        var temp = "td";
        var tr = addNODE('tr');
        for (var i = 0; i < num; i++) {
            var td = addNODE(temp);
            td.contentEditable = true;
            tr.appendChild(td);
        }
        td = addNODE(temp);
        td.innerHTML = "<a href='javascript:;' onclick='deleteRow(tb,this)'>删除</a>";
        td.contentEditable = false;
        tr.appendChild(td);
        tbb.appendChild(tr);
    }
    Highlight();
}
function deleteRow(tb, obj) {
    var tbody = tb.lastElementChild;
    var tr = obj.parentNode.parentNode;
    tbody.removeChild(tr);
}
function Highlight() {
    var tbody = iD('tbo');
    trs = tbody.getElementsByTagName('tr');
    for (var i = 0; i < trs.length; i++) {
        trs[i].onmouseover = function () {
            this.style.backgroundColor = "#f2f2f2";
        };
        trs[i].onmouseout = function () {
            this.style.backgroundColor = "#fff";
        };
    }
}
function loadPaper() {
    var paper = new AV.Query('Paper');
    paper.addAscending("name");
    paper.find().then(function (results) {
        tempPaper = results;
        var pa = iD("paper");
        for (var i = 0; i < results.length; i++) {
            var op = addNODE("option");
            op.innerHTML = results[i].get("name");
            op.title = results[i].get("detail");
            pa.appendChild(op);
        }
    });
}
/********************************************/
function uploadScalePage() {
    nullNotNeed();
    iD("one").innerHTML = '<form class="form" onchange=\'iD("editbtn").disabled=false;\'><h2>请填写量表的相关信息</h2><input class="box" type="text" id="tbname" placeholder="表名：（必选项）比如：PHQ-9" required/>' +
        '<br/><div title="量表的类型"><label><input name="r1" type="radio" value="1" checked="checked"/>私有表</label>&nbsp;&nbsp;<label><input name="r1" type="radio" value="0"/>公有表</label></div>' +
        '<br/><textarea class="textarea" id="detail" rows="5" placeholder="描述：（可选项）请填写一些量表的简单介绍等说明信息"></textarea>' +
        '<br/><input class="btn" id="editbtn" type="button" value="编辑量表" disabled="disabled" onclick="editScale()" >' +
        '&nbsp;<input class="btn" id="temp1" type="button" value="添加问题行" disabled="disabled" onclick=\'addOneLine(iD("tb"),9,1)\'>' +
        '&nbsp;<input class="btn" id="temp2" type="button" value="添加结论行" disabled="disabled" onclick=\'addConsequenceLine()\'>' +
        '&nbsp;<input class="btn" id="temp3" type="button" value="提交上传" disabled="disabled" onclick=\'commitScalePage()\'></form>' +
        '<p style="color: hotpink;font-size: small">注意：请输入基数列，以便分数和选项对应；若选项数少于四个请将后面的选项留空；请注意下面结论部分的填写。以上设置（修改列数将重置量表）在最终提交上传前仍可更改！！！</p>';
}
function logedPage() {
    getCurrentDoctor();
    nullNotNeed();
    loadPaper();
    iD("menu").style.display = 'block';
    iD("menu").innerHTML = '<input id="pushScalePageBtn" class="menu" type="button" value="发起测评" onclick="pushScalePage()"/><input id="uploadScalePageBtn" class="menu" type="button" value="上传量表" onclick="uploadScalePage()"/><input id="logedPageBtn" type="button" class="menu" value="下载量表"  onclick="logedPage()"/><input id="logOutBtn" class="menu" type="button" value="退出" onclick="logOut()"/>';
    iD("one").innerHTML = '<div class="form"><h2>请选择要下载的记录范围</h2><span onchange="iD(\'tjylBtn\').disabled=false"><input class="box" type="date" id="begindate" title="（必选）开始时间" required/><br><input class="box" type="date" title="（必选）结束时间" id="enddate" required/><br><select class="box" id="paper" style="width:330px" title="（必选）量表的名称"></select></span>' +
        '<br><input id="tjylBtn" class="btn" disabled="disabled" type="button" value="提交并预览" onclick=\'seeResults(iD("tb"),iD("begindate").value,iD("enddate").value,getSelect(iD("paper")))\'/>' +
        '&nbsp;<input id="down" class="btn" disabled="disabled" type="button" value="付款并下载" onclick=\'downResults(iD("tb"),iD("begindate").value,iD("enddate").value,getSelect(iD("paper")))\'/></div>' +
        '<p style="color: hotpink;font-size: small">注意：您可以预览结果，想要详细结果需要下载</p>';
}
function editInfoPage() {
    iD("one").innerHTML = "<h2>个人信息</h2>" +
        "<div title='该页可选，但请尽量填完整信息' id='doctorinfo'><input type='text' class='box'placeholder='姓名'/><br/><input type='text' class='box' placeholder='性别'/><br/><input type='text' class='box' placeholder='地址'/><br/><input type='text'class='box'placeholder='薪酬（诊断一次的费用）'/><br/>" +
        "<textarea class='textarea' id='intro' placeholder='个人介绍' rows='4'wrap='soft'></textarea><br/><input class='box'placeholder='照片,小于1M'title='照片,小于1M' style='color:blue' type='file' id='imgfile' accept='image/jpeg,image/png,image/bmp' onchange='viewImg()'/><br/><img id='img' style='margin: 0 auto;display: none' alt='请上传照片,此处预览图片' src='' width='200px'/></div>" +
        "<input class='logbtn' type='button'style='margin-top: 20px' value='提交并登录' onclick='saveDoctor()' onmouseover='this.style.backgroundColor=\"#565aff\" ' onmouseout='this.style.backgroundColor=\"#7496dd\" '/>";
}
function registerPage() {
    nullNotNeed();
    iD("one").innerHTML = "<input class='logbtn' type='button' value='返回登陆' onclick='nologedPage()'" +
        "onmouseover='this.style.backgroundColor=\"#565aff\" 'onmouseout='this.style.backgroundColor=\"#7496dd\" '" +
        "style='position: absolute; left: 20px;padding: 8px;width: 100px'><h1>注  册</h1>" +
        "<div id='register'><input type='text' class='box'placeholder='账号'/><br/><input type='password' class='box' placeholder='密码'/><br/><input type='text' class='box'placeholder='手机号'/><br/><input type='text'class='box'placeholder='邮箱'/></div>" +
        "<input id='registerBtn' class='logbtn' type='button' value='提  交' onclick='register()'" +
        "onmouseover='this.style.backgroundColor=\"#565aff\" 'onmouseout='this.style.backgroundColor=\"#7496dd\" '/>";
}
function nologedPage() {
    iD("menu").style.display = 'none';
    nullNotNeed();
    iD("one").innerHTML = '<form class="form" method="POST" ><h1 style="background-color: beige">欢迎使用心理测评APP系统</h1><input placeholder="账号" class="box" type="text" id="uid"/><br/><input placeholder="密码" class="box" type="password" id="pwd"/><br/>' +
        '<input type="button" class="logbtn" value="登  陆" onclick="login()" onmouseover=\'this.style.backgroundColor="#565aff"\' onmouseout=\'this.style.backgroundColor="#7496dd"\' />&nbsp;&nbsp;<input type="button" class="logbtn" value="注  册" onclick="registerPage()" onmouseover=\'this.style.backgroundColor="#565aff"\'onmouseout=\'this.style.backgroundColor="#7496dd"\'/></form><p style="color: hotpink;font-size: small">提示：为了您的使用体验，我们建议使用"谷歌浏览器"</p>';
}
function pushScalePage(){
    
}
function push() {
        AV.Push.send({
            channels: ['public'],
            data: {
                "action": "com.cx.PAPER_PUBLISH",
                "message": "有新测评",
                "alert": "这是一个测评 bulabula",
                "code": "123456",
                "paper": result,
                "expiration_time": "2016-05-27 23:59:59"
            }
        });
}
//&nbsp;<label>测评发布码：<input type="text" name="releasetext" placeholder="（可选项）发起测评活动的码"/></label>




