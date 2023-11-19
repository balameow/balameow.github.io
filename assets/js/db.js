// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClrEzApI0Ao-Lk4ANjqoTJ1xa2RekHOoE",
    authDomain: "balameow-c40ef.firebaseapp.com",
    databaseURL: "https://balameow-c40ef-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "balameow-c40ef",
    storageBucket: "balameow-c40ef.appspot.com",
    messagingSenderId: "938455898823",
    appId: "1:938455898823:web:d0a10a7b6be3a9c30b7ce2"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

var get_start = (function ()
{
    function init()
    {
        _getData();
    }

    return {
        init
    }

})();

// get and display data
function _getData() {
    db.ref(`/ledger`).once('value').then((snapshot) => {
        var data = snapshot.val();
        if (data)
        {
            var allData = [];
            var len = 0;

            for (let key in data) {
                var obj = {
                    key: key,
                    date: data[key].date,
                    amount: data[key].amount,
                    event: data[key].event,
                    member: data[key].member
                };
                allData.push(obj);
                len ++;
            }
            allData.sort((a,b) => Date.parse(b.date) - Date.parse(a.date));
            _createPageStr(len, allData);
        }
    });
}

// update to page
function _createPageStr(len, allData) {
    var allLedger = document.querySelector("#allLedger");
    var balanceNum = document.querySelector("#balanceNum");
    var revenueNum = document.querySelector("#revenueNum");
    var costNum = document.querySelector("#costNum");
    var str = `<div class="container" style="text-align: center;">`;
    var i = 0;
    var money = "";
    var style = "";
    var balance = 0;
    var revenue = 0;
    var cost = 0;
    var revenueTable = [0, 0, 0, 0, 0];
    var costTable = [0, 0, 0, 0, 0];
    for (i = 0; i < len; i++) {
        var useStyle = "";
        var donateStyle = "";
        var selectStyle = ["", "", "", "", ""];

        if (allData[i].amount >= 0)
        {
            money = "+" + allData[i].amount;
            style = "color:green;"
            revenue += parseInt(allData[i].amount);
            revenueTable = countRevenueCost(revenueTable, allData[i].member, allData[i].amount);
            donateStyle = "selected";
        }
        else
        {
            money = allData[i].amount;
            style = "color:red;"
            cost += parseInt(allData[i].amount);
            costTable = countRevenueCost(costTable, allData[i].member, Math.abs(allData[i].amount));
            useStyle = "selected";
        }

        if (allData[i].member.includes("Wade")) selectStyle[0] = "checked";
        if (allData[i].member.includes("Donna")) selectStyle[1] = "checked";
        if (allData[i].member.includes("Sammy")) selectStyle[2] = "checked";
        if (allData[i].member.includes("Ken")) selectStyle[3] = "checked";
        if (allData[i].member.includes("Sandy")) selectStyle[4] = "checked";

        str += `
            <div class="card border border-dark">
                <div class="card-body">
                    <h5 class="card-text fs-5 fw-bold">${allData[i].event}</h5>
                    <h5 class="card-text fw-bold" style="position: absolute; top: 20px; right: 5px; text-align:center; font-size: 22px; ${style}">${money}</h5>
                    <h6 class="card-text text-muted" style="position: absolute; top: 3px; left: 5px; text-align:right; font-size: 12px;">${allData[i].date}</h6>
                    <h6 class="card-text text-muted" style="position: absolute; top: 25px; left: 5px; text-align:right; font-size: 9px;">${allData[i].member}</h6>
                    <i data-bs-toggle="modal" data-bs-target="#checkModal-${allData[i].key}" class="bx bx-edit bx-xs bx-tada-hover text-primary" style="position: absolute; bottom: 1px; left: 1px;"></i>
                </div>
            </div>
            <div class="modal fade" id="checkModal-${allData[i].key}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="checkModal-${allData[i].key}Label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="checkModal-${allData[i].key}Label">更新/刪除</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <select id="update_tag-${allData[i].key}" class="form-select form-select-sm mb-3" aria-label=".form-select-sm example">
                                <option value="update_use-${allData[i].key}" ${useStyle}>我要使用</option>
                                <option value="update_donate-${allData[i].key}" ${donateStyle}>我要捐款</option>
                            </select>
                            <div class="form-check mb-3" style="float:left;">
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Wade-${allData[i].key}" ${selectStyle[0]}> Wade</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Donna-${allData[i].key}" ${selectStyle[1]}> Donna</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Sammy-${allData[i].key}" ${selectStyle[2]}> Sammy</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Ken-${allData[i].key}" ${selectStyle[3]}> Ken</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Sandy-${allData[i].key}" ${selectStyle[4]}> Sandy</label>
                            </div>
                            <div class="mb-3" style="float:left;">
                                <input type="date" id="update_date-${allData[i].key}" name="date">
                            </div>
                            <div class="input-group input-group-sm mb-3">
                                <input type="number" class="form-control" id="update_money-${allData[i].key}" step="100" min="0" max="10000000" value="${Math.abs(money)}">
                            </div>
                            <form id="update_myForm-${allData[i].key}">
                                <div class="mb-3">
                                    <input type="text" class="form-control" id="update_note-${allData[i].key}" maxlength="20" value="${allData[i].event}">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                        <button onclick="updateEvent('${allData[i].key}')" type="button" class="btn btn-dark" data-bs-dismiss="modal">更新</button>
                            <button onclick="deleteEvent('${allData[i].key}')" type="button" class="btn btn-dark" data-bs-dismiss="modal">刪除</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }
    str += `</div>`
    allLedger.innerHTML = str;
    balance = revenue + cost;
    db.ref(`/account/balance`).set(balance);
    db.ref(`/account/revenue`).set(revenue);
    db.ref(`/account/cost`).set(cost);
    balanceNum.innerHTML = "$ " + balance;
    revenueNum.innerHTML = "$ " + revenue;
    costNum.innerHTML = "$ " + cost*(-1);
    createBarChartData("RevenueCanvas", "green", revenueTable, "revenue")
    createBarChartData("CostCanvas", "red", costTable, "cost")
}

// count revenue and cost seperately
function countRevenueCost(array, members, money)
{
    var memberArray = members.split(",");
    var length = memberArray.length;
    if (members.includes("Wade")) array[0] += (money/length);
    if (members.includes("Donna")) array[1] += (money/length);
    if (members.includes("Sammy")) array[2] += (money/length);
    if (members.includes("Ken")) array[3] += (money/length);
    if (members.includes("Sandy")) array[4] += (money/length);
    return array;
}

// time
function _DateTimezone(offset)
{
    d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * offset)).toLocaleDateString();
}

// manipulateFund
function manipulateFund()
{
    var tag = $('#tag').val();
    var date = $('#date').val();
    var money = $('#money').val();
    var note = $('#note').val();
    var membersGroup = "";
    if(document.getElementById('Wade').checked) membersGroup += "Wade,";
    if(document.getElementById('Donna').checked) membersGroup += "Donna,";
    if(document.getElementById('Sammy').checked) membersGroup += "Sammy,";
    if(document.getElementById('Ken').checked) membersGroup += "Ken,";
    if(document.getElementById('Sandy').checked) membersGroup += "Sandy,";
    if (tag == "use") money *= -1;
    if (date == "") date = _DateTimezone(8);
    
    membersGroup = membersGroup.slice(0, -1);
    date = date.replaceAll("-", "/");;
    if (money != 0 && note != "")
    {
        db.ref(`/ledger`).push({
            amount : money,
            date: date,
            event: note,
            member: membersGroup
        });
    }
    _getData();
    $('#myForm')[0].reset();
}

// updateEvent
function updateEvent(key)
{
    var tag = $(`#update_tag-${key}`).val();
    var date = $(`#update_date-${key}`).val();
    var money = $(`#update_money-${key}`).val();
    var note = $(`#update_note-${key}`).val();
    var membersGroup = "";
    if(document.getElementById(`update_Wade-${key}`).checked) membersGroup += "Wade,";
    if(document.getElementById(`update_Donna-${key}`).checked) membersGroup += "Donna,";
    if(document.getElementById(`update_Sammy-${key}`).checked) membersGroup += "Sammy,";
    if(document.getElementById(`update_Ken-${key}`).checked) membersGroup += "Ken,";
    if(document.getElementById(`update_Sandy-${key}`).checked) membersGroup += "Sandy,";
    if (tag == `update_use-${key}`) money *= -1;
    if (date == "") date = _DateTimezone(8);

    membersGroup = membersGroup.slice(0, -1);
    date = date.replaceAll("-", "/");;
    if (money != 0 && note != "")
    {
        db.ref(`/ledger/${key}/amount`).set(money);
        db.ref(`/ledger/${key}/date`).set(date);
        db.ref(`/ledger/${key}/event`).set(note);
        db.ref(`/ledger/${key}/member`).set(membersGroup);
    }
    _getData();
}

// delete event
function deleteEvent(key)
{
    db.ref(`/ledger/${key}`).remove();
    _getData();
}

// bar charts
function createBarChartData(canvas, color, memberArray, label)
{
    $(`#${canvas}`).remove();
    $(`#${canvas}Container`).append(`<canvas id="${canvas}"><canvas>`);
    var ctx = document.getElementById(canvas).getContext("2d");
    var xValues = ["Wade", "Donna", "Sammy", "Ken", "Sandy"];
    var yValues = [Math.floor(memberArray[0]), Math.floor(memberArray[1]), Math.floor(memberArray[2]), Math.floor(memberArray[3]), Math.floor(memberArray[4])];
    var barColors = [color, color, color, color, color];

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                label: label,
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            responsive: true,
            legend: { //是否要顯示圖示
                display: true,
            },
            tooltips: { //是否要顯示 tooltip
                enabled: true
            },
            scales: {  //是否要顯示 x、y 軸
                xAxes: [{
                    display: true
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: Math.max(...yValues),
                        stepSize: 500
                    }
                }]
            },
        }
    });
    
}
