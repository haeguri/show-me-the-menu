let container = document.querySelector('.container');
let ul = document.querySelector('.container ul.item-list');

fetch('/api/menus/').then((res) => { 
                    res.json().then((data) => onFetchSuccess(data)) 
                }).catch((res) => 
                    console.log('error raised', res)
                );

function onFetchSuccess(jsonRes) {
    for(let i = 0; i < jsonRes.data.length; i++) {
        let createdTime = new Date(jsonRes.data[i].created_time * 1000);

        let headerData = {
            year: createdTime.getFullYear(),
            month: createdTime.getMonth() + 1,
            date: createdTime.getDate(),
            hour: createdTime.getHours()
        };

        let feedMessage = jsonRes.data[i].message || '';
        let foodList = feedMessage.split('\n');
        foodList = foodList.slice(1);

        let menuList = [];
        let menu = [];

        foodList.forEach((food, index) => {
            if(food.trim('') === 'ㅡ') {
                menuList.push(menu);
                menu = [];
                return;
            } else {
                menu.push(food);

                if(index === foodList.length-1) {
                    menuList.push(menu);
                }
            }
        })

        // 서브 메뉴가 안나온다.
        if(menuList.length === 1) {
            let imgData = jsonRes.data[i].attachments.data[0];
            let itemElement = createItemElement({
                headerData: headerData,
                imgSrc: imgData.media.image.src,
                foodList: menuList[0]
            });

            ul.appendChild(itemElement);
        }

        // 서브 메뉴가 나온다.
        else if ( menuList.length > 1 ) {
            // 서브 메뉴의 개수대로 카드를 더 만들어야 한다.
            jsonRes.data[i].attachments.data.forEach((obj, index) => {
                if(obj.hasOwnProperty('subattachments')) {
                    obj.subattachments.data.forEach((obj, index) => {
                        let itemElement = createItemElement({
                            headerData: headerData,
                            imgSrc: obj.media.image.src,
                            foodList: menuList[index]
                        });

                        ul.appendChild(itemElement);
                    });
                }
            })
        }
    }
}

function getTimeBadgeText(hour) {
    if(0 <= hour && hour < 14) {
        return '점심';
    } 
    else if(14 <= hour && hour < 20){
        return '저녁';
    }
}

function getTimeBadgeClass(hour) {
    if(0 <= hour && hour < 14) {
        return 'lunch';
    } 
    else if(14 <= hour && hour < 20) {
        return 'dinner';
    }
}

function createItemElement(data) {
    var headerData = data.headerData;
    var imgSrc = data.imgSrc;
    var foodList = data.foodList;

    var itemElement = document.createElement('li');
    itemElement.className = 'item';

    itemElement = createItemHeader(itemElement, headerData);
    itemElement = createItemImg(itemElement, {
        imgSrc: imgSrc
    });
    itemElement = createItemMsg(itemElement, {
        foodList: foodList
    });

    return itemElement;
}

function createItemHeader(itemElement, data) {
    var year = data.year;
    var month = data.month;
    var date = data.date;
    var hour = data.hour;

    var itemHeader = document.createElement('div');
    itemHeader.className = 'item-header';

    var badge = document.createElement('span');
    badge.className = 'badge' + ' ' + getTimeBadgeClass(hour);
    badge.innerText = getTimeBadgeText(hour);

    var title = document.createElement('h3');
    title.className = 'title';
    title.innerText = year+'년 ' + month+'월 ' + date+'일 ';

    itemHeader.appendChild(badge);
    itemHeader.appendChild(title);

    itemElement.appendChild(itemHeader);

    return itemElement;
}

function createItemImg(itemElement, data) {
    var imgSrc = data.imgSrc;

    var itemImg = document.createElement('div');
    itemImg.className = 'item-img';

    var img = document.createElement('img');
    img.src = imgSrc;

    itemImg.appendChild(img);
    itemElement.appendChild(itemImg);

    return itemElement;
}

function createItemMsg(elemItem, data) {
    var foodList = data.foodList;

    var elemItemMsg = document.createElement('div');
    elemItemMsg.className = 'item-msg';

    var elemFoodList = document.createElement('ul');
    elemFoodList.className = 'food-list';

    foodList.forEach(function(food, index) {
        var elemFoodItem = document.createElement('li');
        elemFoodItem.className = 'food';
        elemFoodItem.innerText = food;

        elemFoodList.appendChild(elemFoodItem);
    })

    elemItemMsg.appendChild(elemFoodList);
    elemItem.appendChild(elemItemMsg);

    return elemItem;
}