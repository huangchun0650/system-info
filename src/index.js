const { 
    QMainWindow,
    QMovie,
    QLabel,
    QWidget,
    FlexLayout,
    QSize, 
    QTabWidget, 
    QListWidget, 
    QListWidgetItem, 
    QIcon, 
    QMessageBox, 
    QPushButton, 
    ButtonRole,
    AlignmentFlag,  
} = require('@nodegui/nodegui');
const axios = require('axios').default;
const os = require('os');
const si = require('systeminformation')

const win = new QMainWindow();
win.setWindowTitle("系統資訊");

const label_cpu_value = new QLabel()
label_cpu_value.setObjectName('itemLabel')
const label_mb_value = new QLabel()
label_mb_value.setObjectName('itemLabel')
const label_ram_value = new QLabel()
label_ram_value.setObjectName('itemLabel')
const label_gpu_value = new QLabel()
label_gpu_value.setObjectName('itemLabel')
const label_disk_value = new QLabel()
label_disk_value.setObjectName('itemLabel')

const main = async () => {

    // 畫面佈局
    const mainView = new QWidget()
    mainView.setLayout(new FlexLayout)
    mainView.setObjectName("mainView")

    // label container
    const labelContainer = new QWidget()
    labelContainer.setLayout(new FlexLayout())
    labelContainer.setObjectName('labelContainer')

    // main container
    const mainContainer = new QWidget()
    mainContainer.setLayout(new FlexLayout())
    mainContainer.setObjectName('mainContainer')

    // in label container
    const mainLabel = new QLabel();
    mainLabel.setText(os.hostname)
    mainLabel.setObjectName('mainLabel')
    mainLabel.setAlignment(AlignmentFlag.AlignCenter)

    labelContainer.layout.addWidget(mainLabel)

    // in main container
    const loadingContainer = new QWidget()
    loadingContainer.setLayout(new FlexLayout())
    loadingContainer.setObjectName('loadingContainer')
    
    // in loading container
    const loadingGif = new QLabel();
    loadingGif.setInlineStyle(`width: ${loadingGif.size().width()}`);
    loadingGif.setObjectName('loadingGif')
    loadingGif.setAlignment(AlignmentFlag.AlignCenter)

    // gif movie
    const gifMovie = await getMovie(
        'https://media0.giphy.com/media/xTkcEQACH24SMPxIQg/100w.gif?cid=a56ef05bn92hurnl09d70hkpqfkin8d0q0vg6v2igh4ns0ou&rid=100w.gif&ct=g'
    );

    gifMovie.setCacheMode(QMovie.CacheAll)
    gifMovie.setSpeed(100)
    // gifMovie.setScaledSize(new QSize(640 , 400))
    loadingGif.setMovie(gifMovie);
    gifMovie.start()

    loadingContainer.layout.addWidget(loadingGif)
    mainContainer.layout.addWidget(loadingContainer)

    // in main view
    mainView.layout.addWidget(labelContainer);
    mainView.layout.addWidget(mainContainer);
    win.setCentralWidget(mainView);

    mainView.setStyleSheet(`
        #mainView {
            flex: 1;
        }
        #labelContainer {
            display: flex;
            flex: 1;
            background-color: #161519;
        }
        #mainLabel {
            flex-grow: 1;
            color: #00ff40;
            font-size: 20px;
            font-weight: bold;
        }
        #mainContainer {
            flex: 9;
            align-items: 'center';
            justify-content: 'center';
            background-color: #161519;
        }
        #loadingContainer {
            height: 100;
            width: '640px';
            flex-direction: 'row';
            flex-wrap: 'wrap';
            justify-content: 'center';
            align-items: 'center';
            background-color: #161519;
        }
        #loadingGif {
            width: '100%';
            height: '100%';
        }
        #allContainer {
            flex: 1;
            align-items: 'flex-start';
            width: '100%';
            height: '100%';
        }
        #detailsList {
            flex: 1;
            background-color: #9d9d9d;
            color: 'black';
            height: '100%';
            width: '100%';
        }
        #tabBar {
            flex: 4;
            height: '100%';
            align-items: 'center';
            justify-content: 'center';
        }
        #postButton {
            margin: 5px;
            width: '90%';
            height: 35px;
        }
        #topContainer {
            flex-direction: 'row';
            flex: 3;
            width: '100%';
            background-color: #ffffff;
        }
        #underContainer {
            flex: 2;
            width: '100%';
        }
        #postContainer {
            flex: 3;
            justify-content: 'center';
            width: '100%';
            background-color: #ffffff;
        }
        #postLabelContainer {
            flex: 1;
            background-color: #ffffff;
        }
        #infoLabel {
            flex-grow: 1;
            flex-wrap: 'wrap';
            color: #ff0000;
            font-size: 16px;
            font-weight: bold;
        }
        #itemLabel {
            flex-grow: 1;
            flex-wrap: 'wrap';
            color: #000000;
            font-size: 10px;
            font-weight: bold;
        }
    `);
    
    // 等待取得資料
    Promise.all([systemInfo]).then(async ([sysInfo]) => {
        loadingGif.clear();
        const systemInfoContainer = await createSystemInfoView(sysInfo)
        mainContainer.layout.removeWidget(loadingContainer)
        mainContainer.layout.addWidget(systemInfoContainer)
        
        renderView()
    })

    renderView()
};

/**
 * getMovie
 * 取得gif
 * @param {String} url 
 * @returns 
 */
async function getMovie(url) {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const movie = new QMovie();
    movie.loadFromData(data);
    movie.start()
    return movie
}

/**
 * systemInfo
 * 取得系統資訊
 */
const systemInfo = new Promise((resolve) => {
    let valueObject = {
        cpu: '*',
        baseboard: '*',
        memLayout: '*',
        graphics: 'controllers',
        diskLayout: '*'
    }

    resolve(si.get(valueObject).then((systemInfo) => { return systemInfo }))
})

/**
 * createSystemInfoView
 * 
 * @param {*} sysInfo 
 * @returns 
 */
const createSystemInfoView = async (sysInfo) => {

    // declarative element
    const allContainer = new QWidget()
    allContainer.setLayout(new FlexLayout())
    allContainer.setObjectName('allContainer')

    const topContainer = new QWidget()
    topContainer.setLayout(new FlexLayout())
    topContainer.setObjectName('topContainer')
 
    const underContainer = new QWidget()
    underContainer.setLayout(new FlexLayout())
    underContainer.setObjectName('underContainer')

    const postContainer = new QWidget()
    postContainer.setLayout(new FlexLayout())
    postContainer.setObjectName('postContainer')

    const tabBar = new QTabWidget()
    tabBar.setObjectName('tabBar')

    const detailsList = new QListWidget()
    detailsList.setObjectName('detailsList')

    const postButton = new QPushButton()
    postButton.setObjectName('postButton')
    postButton.setText(' 🔺 ')

    const postLabelContainer = new QWidget()
    postLabelContainer.setLayout(new FlexLayout())
    postLabelContainer.setObjectName('postLabelContainer')

    const label_cpu = new QLabel()
    label_cpu.setObjectName('infoLabel')
    label_cpu.setText('CPU :')
    const label_mb = new QLabel()
    label_mb.setObjectName('infoLabel')
    label_mb.setText('MB :')
    const label_ram = new QLabel()
    label_ram.setObjectName('infoLabel')
    label_ram.setText('Ram :')
    const label_gpu = new QLabel()
    label_gpu.setObjectName('infoLabel')
    label_gpu.setText('GPU :')
    const label_disk = new QLabel()
    label_disk.setObjectName('infoLabel')
    label_disk.setText('Disk :')

    const cpu = new QListWidget()
    const mb = new QListWidget()
    const ram = new QListWidget()
    const gpu = new QListWidget()
    const disk = new QListWidget()
    
    // create tabBar item
    createTabBarItems()
    // combine the container
    combineContainer()
    // create listener
    createListener()

    return allContainer

    /**
     * createTabBarItems
     * 資料寫入tabBar item中
     */
    function createTabBarItems() {
        let arr = []
        let postArray = []
        // cpu
        const cpu_i = new QListWidgetItem()
        const cpuName = sysInfo.cpu.manufacturer + sysInfo.cpu.brand
        cpu_i.setText(cpuName)
        label_cpu_value.setText(cpuName)
        cpu.addItem(cpu_i)

        // mb
        const mb_i = new QListWidgetItem()
        const mbName = sysInfo.baseboard.manufacturer + sysInfo.baseboard.model
        mb_i.setText(mbName)
        label_mb_value.setText(mbName)
        mb.addItem(mb_i)

        // ram
        let totalRam = 0
        sysInfo.memLayout.forEach((mem) => {
            let ram_i = new QListWidgetItem()
            ram_i.setText(mem.manufacturer + '-' + mem.partNum)
            ram.addItem(ram_i)
            arr.push(mem.manufacturer + '-' + mem.partNum)
            totalRam = totalRam + mem.size
        })
        postArray = [...new Set(arr)]
        let ramName = ''
        postArray.forEach((item, index) => {
            let count = arr.filter(element => element == item).length
            if (index == 0) {
                ramName = item + ' x' + count
            } else {
                ramName = ramName + ',\n' + item + ' x' + count
            }
        })
        label_ram_value.setText(ramName)
        
        // total ram
        let total = new QListWidgetItem()
        total.setText('Total :' + bytesToSize(totalRam))
        ram.addItem(total)

        // disk
        arr = []
        postArray = []
        sysInfo.diskLayout.forEach((diskItem) => {
            let disk_i = new QListWidgetItem()
            disk_i.setText(diskItem.name)
            disk.addItem(disk_i)
            arr.push(diskItem.name)
        })
        postArray = [...new Set(arr)]
        let diskName = ''
        postArray.forEach((item, index) => {
            let count = arr.filter(element => element == item).length
            if (index == 0) {
                diskName = item + ' x' + count
            } else {
                diskName = diskName + ',\n' + item + ' x' + count
            }
        })
        label_disk_value.setText(diskName)

        // gpu
        arr = []
        postArray = []
        sysInfo.graphics.controllers.forEach((gpuItem) => {
            let gpu_i = new QListWidgetItem()
            gpu_i.setText(gpuItem.model)
            gpu.addItem(gpu_i)
            arr.push(gpuItem.model)
        })
        postArray = [...new Set(arr)]
        let gpuName = ''
        postArray.forEach((item, index) => {
            let count = arr.filter(element => element == item).length
            if (index == 0) {
                gpuName = item + ' x' + count
            } else {
                gpuName = gpuName + ',\n' + item + ' x' + count
            }
        })
        label_gpu_value.setText(gpuName)

        tabBar.addTab(cpu, new QIcon(), 'CPU')
        tabBar.addTab(mb, new QIcon(), 'MB')
        tabBar.addTab(ram, new QIcon(), 'RAM')
        tabBar.addTab(gpu, new QIcon(), 'GPU')
        tabBar.addTab(disk, new QIcon(), 'SSD & HDD')
    }
    
    /**
     * combineContainer
     * 組合容器
     */
    function combineContainer() {
        postLabelContainer.layout.addWidget(label_cpu)
        postLabelContainer.layout.addWidget(label_cpu_value)
        postLabelContainer.layout.addWidget(label_mb)
        postLabelContainer.layout.addWidget(label_mb_value)
        postLabelContainer.layout.addWidget(label_ram)
        postLabelContainer.layout.addWidget(label_ram_value)
        postLabelContainer.layout.addWidget(label_gpu)
        postLabelContainer.layout.addWidget(label_gpu_value)
        postLabelContainer.layout.addWidget(label_disk)
        postLabelContainer.layout.addWidget(label_disk_value)
        // postButton & postLabel in postContainer
        postContainer.layout.addWidget(postLabelContainer)
        postContainer.layout.addWidget(postButton)
        // tabBar & postContainer in topContainer
        topContainer.layout.addWidget(tabBar)
        topContainer.layout.addWidget(postContainer)
        // detailsList in underContainer
        underContainer.layout.addWidget(detailsList)
        // topContainer & underContainer in allContainer
        allContainer.layout.addWidget(topContainer)
        allContainer.layout.addWidget(underContainer)
    }

    /**
     * createListener
     * 監聽組件功能事件
     */
    function createListener() {
        // cpu
        cpu.addEventListener('itemClicked', async (data) => {
            // showModal(sysInfo.cpu)
            detailsList.clear()
            detailsList.addItems(await showInfoDetails(sysInfo.cpu))
        })
        // mb
        mb.addEventListener('itemClicked', async (data) => {
            // showModal(sysInfo.baseboard)
            detailsList.clear()
            detailsList.addItems(await showInfoDetails(sysInfo.baseboard))
        })
        // disk
        disk.addEventListener('itemClicked', async (data) => {
            detailsList.clear()
            let itemIndex = disk.row(new QListWidgetItem(data))
            detailsList.addItems(await showInfoDetails(sysInfo.diskLayout[itemIndex]))
        })
        // ram
        ram.addEventListener('itemClicked', async (data) => {
            let itemIndex = ram.row(new QListWidgetItem(data))
            if (itemIndex !== (ram.count() - 1)) {
                detailsList.clear()
                detailsList.addItems(await showInfoDetails(sysInfo.memLayout[itemIndex]))
                // showModal(sysInfo.memLayout[itemIndex])
            }
        })
        // gpu
        gpu.addEventListener('itemClicked', async (data) => {
            let itemIndex = gpu.row(new QListWidgetItem(data))
            detailsList.clear()
            detailsList.addItems(await showInfoDetails(sysInfo.graphics.controllers[itemIndex]))
            // showModal(sysInfo.graphics.controllers[itemIndex])
        })
        // button
        postButton.addEventListener('clicked', () => {
            showModal()
            console.log(win.size().height(), win.size().width())
        })
    }
}

/**
 * renderView
 * 畫面渲染重讀
 */
const renderView = async () => {
    win.setMinimumSize(700, 560)
    // win.setMaximumSize(1400, 1120)
    win.show();
    global.win = win;
}

/**
 * showModal
 * message box 通知模式
 */
const showModal = async () => {
    let str = 'CPU: ' + label_cpu_value.text() + ',\n' +
        'MB: ' + label_mb_value.text() + ',\n' +
        'Ram: ' + label_ram_value.text() + ',\n' +
        'GPU: ' + label_gpu_value.text() + ',\n' +
        'Disk: ' + label_disk_value.text()
    const modal = new QMessageBox();
    modal.setText('Check ?');
    modal.setDetailedText(str);
    const okButton = new QPushButton();
    const cancelButton = new QPushButton();
    okButton.setText('OK');
    cancelButton.setText('Cancel');
    modal.addButton(okButton);
    modal.addButton(cancelButton, ButtonRole.AcceptRole);
    modal.exec();
}

/**
 * showInfoDetails
 * 右側資訊
 * @param {Object} details 
 * @returns 
 */
const showInfoDetails = async (details) => {
    let infoArray = []
    const zhTranslateData = myConfig.zh;
    for (const [key, value] of Object.entries(details)) {
        if (typeof value !== 'object' && !Array.isArray(value) && value !== null) {
            if (value !== "") {
                if (key in zhTranslateData) {
                    if (key == 'size'){
                        infoArray.push(`${zhTranslateData[key]}: ${bytesToSize(value)}`)
                    } else infoArray.push(`${zhTranslateData[key]}: ${value}`)
                } else {
                    infoArray.push(`${key}: ${value}`)
                }
            }
        }
    }
    return infoArray;
}

/**
 * bytesToSize
 * bytes 大小格式化轉換
 * @param {Integer} bytes 
 * @returns 
 */
function bytesToSize(bytes) {
    if (bytes == 0) return '0 B'

    var k = 1024

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return ((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i])
}

main().catch(console.error);
