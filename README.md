<div id="table-of-contents">
<h2>Table of Contents</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Various operations for helping Tizen usage with AngularJS</a>
<ul>
<li><a href="#sec-1-1">1.1. HTTP Request relaying</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. <span class="todo TODO">TODO</span> Change request sending to Volley or some other sensible method</a></li>
</ul>
</li>
<li><a href="#sec-1-2">1.2. Sample GET</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. <span class="todo TODO">TODO</span> Create relaying  XMLHttpRequests</a></li>
<li><a href="#sec-1-2-2">1.2.2. <span class="todo TODO">TODO</span> Workaround JSONP requests</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. <span class="todo TODO">TODO</span> Tau hiding</a></li>
<li><a href="#sec-1-4">1.4. <span class="todo TODO">TODO</span> Touch/Button events</a></li>
<li><a href="#sec-1-5">1.5. <span class="done DONE">DONE</span> Android Provider for HTTP relay</a></li>
<li><a href="#sec-1-6">1.6. Compilation</a>
<ul>
<li><a href="#sec-1-6-1">1.6.1. <span class="todo TODO">TODO</span> Streamline</a></li>
<li><a href="#sec-1-6-2">1.6.2. AndroidProvider</a></li>
<li><a href="#sec-1-6-3">1.6.3. AngularTizen</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>

# Various operations for helping Tizen usage with AngularJS<a id="sec-1" name="sec-1"></a>

The goal is to hide Tizen specifics under AngularJS modules.

## HTTP Request relaying<a id="sec-1-1" name="sec-1-1"></a>

### TODO Change request sending to Volley or some other sensible method<a id="sec-1-1-1" name="sec-1-1-1"></a>

## Sample GET<a id="sec-1-2" name="sec-1-2"></a>

// GET
{
    "method":"GET"
    headers = [
        "foo":"bar"
    ]
    url = "<http://url>"
    data = ""
}

->

{
   response = "data.."
}

### TODO Create relaying  XMLHttpRequests<a id="sec-1-2-1" name="sec-1-2-1"></a>

### TODO Workaround JSONP requests<a id="sec-1-2-2" name="sec-1-2-2"></a>

## TODO Tau hiding<a id="sec-1-3" name="sec-1-3"></a>

## TODO Touch/Button events<a id="sec-1-4" name="sec-1-4"></a>

## DONE Android Provider for HTTP relay<a id="sec-1-5" name="sec-1-5"></a>

## Compilation<a id="sec-1-6" name="sec-1-6"></a>

### TODO Streamline<a id="sec-1-6-1" name="sec-1-6-1"></a>

### AndroidProvider<a id="sec-1-6-2" name="sec-1-6-2"></a>

Samsung accessory sdk required: <http://developer.samsung.com/gear/develop/sdk#samsung-accessory-sdk>: place the accssory-v2.3.0.jar and sdk-v1.0.0.jar under AndroidProvider/libs/

### AngularTizen<a id="sec-1-6-3" name="sec-1-6-3"></a>

Under lib put angular,angular-mocks,tau

Licence GPL v3, except if specified otherwise in the file