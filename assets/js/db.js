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
            var keys = [];
            var dates = [];
            var amounts = [];
            var events = [];
            var members = [];
            var len = 0;

            for (let key in data) {
                keys.push(key);
                dates.push(data[key].date);
                amounts.push(data[key].amount);
                events.push(data[key].event);
                members.push(data[key].member);
                len ++;
            }
            _createPageStr(len, keys, dates, amounts, events, members);
        }
    });
}

// update to page
function _createPageStr(len, keys, dates, amounts, events, members) {
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
    for (i = len-1; i >= 0; i--) {
        if (amounts[i] >= 0)
        {
            money = "+" + amounts[i];
            style = "color:green;"
            revenue += parseInt(amounts[i]);
            revenueTable = countRevenueCost(revenueTable, members[i], amounts[i]);
        }
        else
        {
            money = amounts[i];
            style = "color:red;"
            cost += parseInt(amounts[i]);
            costTable = countRevenueCost(costTable, members[i], amounts[i]*(-1));
        }
        str += `
            <div class="card border border-dark">
                <div class="card-body">
                    <h5 class="card-text fs-5 fw-bold">${events[i]}</h5>
                    <h5 class="card-text fw-bold" style="position: absolute; top: 20px; right: 5px; text-align:center; font-size: 22px; ${style}">${money}</h5>
                    <h6 class="card-text text-muted" style="position: absolute; top: 3px; left: 5px; text-align:right; font-size: 12px;">${dates[i]}</h6>
                    <h6 class="card-text text-muted" style="position: absolute; top: 25px; left: 5px; text-align:right; font-size: 9px;">${members[i]}</h6>
                    <i data-bs-toggle="modal" data-bs-target="#checkModal" class="bx bx-edit bx-xs bx-tada-hover text-primary" style="position: absolute; bottom: 1px; left: 1px;"></i>
                </div>
            </div>
            <div class="modal fade" id="checkModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="manipulateFundLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="checkModalLabel">更新/刪除</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <select id="update_tag" class="form-select form-select-sm mb-3" aria-label=".form-select-sm example">
                                <option value="update_use">我要使用</option>
                                <option value="update_donate">我要捐款</option>
                            </select>
                            <div class="form-check mb-3" style="float:left;">
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Wade"> Wade</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Donna"> Donna</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Sammy"> Sammy</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Ken"> Ken</label>
                                <label style="margin: 0px 15px;"><input class="form-check-input" type="checkbox" value="" id="update_Sandy"> Sandy</label>
                            </div>
                            <div class="mb-3" style="float:left;">
                                <input type="date" id="update_date" name="date">
                            </div>
                            <div class="input-group input-group-sm mb-3">
                                <input type="number" class="form-control" id="update_money" step="100" min="0" max="10000000">
                            </div>
                            <form id="update_myForm">
                                <div class="mb-3">
                                    <input type="text" class="form-control" id="update_note" maxlength="20">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                        <button onclick="updateEvent('${keys[i]}')" type="button" class="btn btn-dark" data-bs-dismiss="modal">更新</button>
                            <button onclick="deleteEvent('${keys[i]}')" type="button" class="btn btn-dark" data-bs-dismiss="modal">刪除</button>
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
    var tag = $('#update_tag').val();
    var date = $('#update_date').val();
    var money = $('#update_money').val();
    var note = $('#update_note').val();
    var membersGroup = "";
    if(document.getElementById('update_Wade').checked) membersGroup += "Wade,";
    if(document.getElementById('update_Donna').checked) membersGroup += "Donna,";
    if(document.getElementById('update_Sammy').checked) membersGroup += "Sammy,";
    if(document.getElementById('update_Ken').checked) membersGroup += "Ken,";
    if(document.getElementById('update_Sandy').checked) membersGroup += "Sandy,";
    if (tag == "update_use") money *= -1;
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
    $('#myForm')[0].reset();
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
