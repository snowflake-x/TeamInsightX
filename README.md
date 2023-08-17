<!--
 * @Author: LightningSw devdreamer1337@outlook.com
 * @Date: 2023-07-22 21:41:37
 * @LastEditors: LightningSw devdreamer1337@outlook.com
 * @LastEditTime: 2023-07-30 17:09:28
 * @FilePath: \TeamInsightX\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# TeamInsightX
Search for teammate information

This is a [Pengu Loader](https://pengu.lol) Plugin

Thank for [nomi](https://github.com/nomi-san) continuous help and support

Please do not use it together with [balance-buff-viewer](https://github.com/nomi-san/balance-buff-viewer), because I use almost the same display method as it

<img src="https://raw.githubusercontent.com/LightningSw/TeamInsightX/main/show.png"/>

### Implement

Borrowed the idea from [balance-buff-viewer](https://github.com/nomi-san/balance-buff-viewer)

### TODO
- [x] Multi-language support
- [ ] Add settings options
- [ ] Add lane information display
### Existing features
Homepage privacy status check

Historical record inquiry

Rank information inquiry

~~KDA display~~ need fix bug

### ~~old version~~ Installation method

Download and extract [Releases](https://github.com/LightningSw/TeamInsightX/releases), then place it in the plugin directory of Pengu Loader, making sure the file path is 
```
📂 Pengu Loader
└── 📂 plugins
    ├── 📂 @default
    └── 📂 TeamInsightX
        ├── 📄 index.js
        ├── 📂 js
        │   ├─ 📄 DataQuery.js
        │   ├─ 📄 LoadDataInfo.js
        │   └─ 📄 tooltip.js
        └── 📂 css
            └── 🎨 resource.css
```

## The latest installation method 
be to download ```TeamInsightX.js``` from [Releases](https://github.com/LightningSw/TeamInsightX/releases/latest), and the file path should be set as shown below
```
📂 Pengu Loader
└── 📂 plugins
    ├── 📂 @default
    └── 📄 TeamInsightX.js
```