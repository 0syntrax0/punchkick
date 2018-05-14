// Check if browser is IE
function isIE()
{
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

// Adding Array.from for IE 11
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}


// Get saved data from browser, if it exists
// INTERT EXPLORER DOES NOT ALLOW ACCESS TO LOCALSTORAGE FROM "file://" PROTOCOL
// https://stackoverflow.com/a/23391501
// Do I still get extra credit?
if (!isIE())
{
    var data = (localStorage.getItem('todoList')) ? JSON.parse(localStorage.getItem('todoList')) : {
        todo: [],
        dateAdded: [],
        completed: []
    };

    // Render li's on page load
    renderTodoList();
}

// Render li's on page load
function renderTodoList()
{
    // check if we have data saved locally
    if (!data.todo.length && !data.dateAdded.length) return;

    // loop through local storage
    for (let i = 0; i < data.todo.length; i++)
    {
        addItemToDOM(data.todo[i], data.dateAdded[i], data.completed[i]);
    }
}


// Add a "checked" symbol when clicking on a list item
document.getElementById('todoList').addEventListener('click', function (e) {
    // Check if we're completing item
    if(e.target.classList.toggle('checked'))
        updateItem('completed', e.target.id);
    else
        updateItem('uncompleted', e.target.id);

    // reload list    
    toggleFilters(getCurrentFilter());
});

// Add to to-do list from input
document.getElementById('addToList').addEventListener('click', function() {
    // get to-do value
    let value = document.getElementById("myInput").value;

    // check if value is empty
    if (value)
    {
        addItem(value);
        document.getElementById("myInput").value = '';
        toggleFilters(getCurrentFilter());
    }
});


// Add item to the list
function addItem(value)
{
    // get current Unix time
    let dateAdded = Math.round((new Date()).getTime() / 1000);
    addItemToDOM(value, dateAdded, '-');

    if (!isIE())
    {
        // Add item to local storage
        data.todo.push(value);
        data.dateAdded.push(dateAdded);
        data.completed.push('-');
        dataObjectUpdated();
    }
}


// update local storage
function dataObjectUpdated()
{
    if (!isIE())
    {
        localStorage.setItem('todoList', JSON.stringify(data));
    }
}


// Remove item from li & local storage
function removeItem()
{
    // set variables
    let parent = this.parentNode.parentNode;
    let item = this.parentElement;
    let dateAdded = parseInt(this.parentNode.id);
    let keyToRemove = data.dateAdded.indexOf(dateAdded);


    // Check to make sure we got a key to delete
    if (keyToRemove > -1)
    {
        // Remove element from page
        parent.removeChild(item);

        // remove element from local storage
        data.todo.splice(keyToRemove, 1);
        data.dateAdded.splice(keyToRemove, 1);
    }

    dataObjectUpdated();
}


// update item
function updateItem(todo, _dateAdded)
{
    // Check to make sure we got a key to update
    if (!isIE())
    {
        let dateAdded = parseInt(_dateAdded);
        let keyToChange = data.dateAdded.indexOf(dateAdded);

        if (keyToChange > -1)
        {
            switch (todo) {
                case 'uncompleted':
                    // remove element from completed list
                    data.completed.splice(keyToChange, 1, '-');
                    break;
                case 'completed':
                    data.completed.splice(keyToChange, 1, dateAdded);
                    break;
                default:
                    return;
                    break;
            }

            dataObjectUpdated();
        }
    }
}


// Add items to DOM
function addItemToDOM(text, UNIXdateAdded, completedCheck)
{
    // add name of To-do to list
    let list = document.getElementById('todoList');
    let item = document.createElement('li');
    let isCompleted = completedCheck !== '-';

    // add item
    item.innerText = text;
    item.setAttribute('id', UNIXdateAdded);
    item.setAttribute('dateAdded', UNIXdateAdded);

    // if item has been completed, add 'checked' class
    if (isCompleted)
    {
        item.className = 'checked';
    }



    // add date item created
    let dateCreated = document.createElement('span');

    // convert time UNIX -> human
    let readableDate = 'Added: '+ timeConverter(UNIXdateAdded);
    let addedDate = document.createTextNode(readableDate);
    dateCreated.className = 'dateAdded';
    dateCreated.appendChild(addedDate);
    item.appendChild(dateCreated);


    // add remove button
    let remove = document.createElement('span');
    let txt = document.createTextNode("\u00D7");
    remove.className = 'close';
    remove.appendChild(txt);
    item.appendChild(remove);


    // listen for when removing list item
    remove.addEventListener('click', removeItem);

    //
    list.insertBefore(item, list.childNodes[0]);
}

// Convert UNIX time to human readable
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = month + ' ' + date + ', ' + year + ' ' + hour +':'+ min +':'+ sec;
    return time;
}

// Sort UL alphabetically
document.getElementById('sortByAlphabetically').addEventListener('click', function() {
    let
        list,
        i,
        switching,
        b,
        shouldSwitch,
        dir,
        switchcount = 0,
        btnElement = document.getElementById('sortByAlphabetically'),
        btnText = btnElement.textContent || btnElement.innerText;

    list = document.getElementById('todoList');
    switching = true;

    // Change btn text
    if (btnText == 'Sort By Alphabetically [a-z]')
        document.getElementById('sortByAlphabetically').innerText = 'Sort By Alphabetically [z-a]';
    else
        document.getElementById('sortByAlphabetically').innerText = 'Sort By Alphabetically [a-z]';
    

    // Set the sorting direction to ascending:
    dir = "asc";

    // Make a loop that will continue until no switching has been done:
    while (switching)
    {
        // Start by saying: no switching is done:
        switching = false;
        b = list.getElementsByTagName('li');

        // Loop through all list-items:
        for (i = 0; i < (b.length - 1); i++)
        {
            // Start by saying there should be no switching:
            shouldSwitch = false;

            /* Check if the next item should switch place with the current item,
            based on the sorting direction (asc or desc): */
            if (dir == "asc")
            {
                if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase())
                {
                    /* If next item is alphabetically lower than current item,
                    mark as a switch and break the loop: */
                    shouldSwitch = true;
                    break;
                }
            }
            else if (dir == "desc")
            {
                if (b[i].innerHTML.toLowerCase() < b[i + 1].innerHTML.toLowerCase())
                {
                    /* If next item is alphabetically higher than current item,
                    mark as a switch and break the loop: */
                    shouldSwitch = true;
                    break;
                }
            }
        }

        //
        if (shouldSwitch)
        {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;

            // Each time a switch is done, increase switchcount by 1:
            switchcount++;
        }
        else
        {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc")
            {
                dir = "desc";
                switching = true;
            }
        }
    }
});


// Sort list by date added
var sortUp = true;
document.getElementById('sortByDateAdded').addEventListener("click", function (e) {
    let sortList = Array.prototype.slice.call(document.querySelectorAll('#todoList li'));

    if (sortUp === true)
    {
        // Change button text
        document.getElementById('sortByDateAdded').innerText = "Sort By Date Added \u2191";

        // sort list
        sortList.sort(function (a, b) {
            return a.getAttribute('dateadded').localeCompare(b.getAttribute('dateadded'));
        }).forEach(function (currValue) {
            currValue.parentNode.appendChild(currValue);
        });

        sortUp = false;
    }
    else
    {
        // Change button text
        document.getElementById('sortByDateAdded').innerText = "Sort By Date Added \u2193";

        // sort list
        sortList.reverse(function (a, b) {
            return a.getAttribute('dateadded').localeCompare(b.getAttribute('dateadded'));
        }).forEach(function (currValue) {
            currValue.parentNode.appendChild(currValue);
        });

        sortUp = true;
    }
});


// Toggle filters
function toggleFilters(todo)
{
    let lis = document.getElementsByTagName('li');
    var filterOption = (typeof (todo) === 'object') ? todo.target.id : todo;

    // Filter through the corresponding radio selection
    switch (filterOption)
    {
        // Show completed tasks
        case 'showComplete':
            // reload list    
            toggleFilters('showAll');
            
            // loop through list
            for (let i = 0; i < lis.length; i++)
            {
                if ( !lis[i].classList.contains('checked') )
                {
                    let li = this.parentElement;
                    lis[i].style.display = 'none';
                }
            }
        break;
        // Show Incomplete tasks
        case 'showIncomplete':           
            // reload list
            toggleFilters('showAll');

            // loop through list
            for (let i = 0; i < lis.length; i++)
            {
                if (lis[i].classList.contains('checked'))
                {
                    let li = this.parentElement;
                    lis[i].style.display = 'none';
                }
            }
        break;
        default:
            for (let i = 0; i < lis.length; i++)
            {
                let li = this.parentElement;
                lis[i].style.display = 'block';
            }
        break;
    }
}

// Toggle Show todo, show completed, show all
let classname = document.getElementsByClassName('filter');
Array.from(classname).forEach(function (e) {
    e.addEventListener('click', toggleFilters);
});


// Get current filter option
function getCurrentFilter()
{
    return document.querySelector('input[name="filter"]:checked').value;
}