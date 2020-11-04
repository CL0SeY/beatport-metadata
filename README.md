# beatport-metadata

Requirements:
-------------
Tested with Node v12.16.2 (Linux)

Setup:
------
```
npm install
```

Usage:
------
```
Usage: index.js [-j|-v|-s] <directory to scan for beatport files>

-v verbose - show errors
-s skip - skip output for files we could not find information for
-j json output - output a simple JSON map of filename: track name
```
e.g.
```
node index.js -s /path/to/my/tunes
```
If you wanted to sort the output, this should work too based on your OS's standard sort utility:
```
node index.js -s /path/to/my/tunes | sort
```
  
Output:
-------
```
12345678 Arist1, Artist2 - Track Title (Whatever Mix) [Record Label]
88888888_My_File_That_Doesnt_Exist_On_BP_Anymore
```

What do I do with the output?:
-------
You could copy and paste the output into "Foobar2000": https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Properties/Automatically_Fill_Values
This will let you update the metadata on your files. Just make sure the order of the output matches the order of your files in foobar.
A pattern you could use in Foobar2000 would be `%beatportid% %artist% - %title% [%label%]`

Note:
-----
This was working at some point. If the format of the beatport embed page breaks, then so be it. PRs welcome.

Beatport, read this:
--------------------
Wouldn't it be nice if there was a real API? And metadata added to .WAV files that people download?
