const { QMainWindow, QMovie, QLabel, QWidget, FlexLayout, QSize, QTabWidget, QListWidget, QListWidgetItem, QIcon, QMessageBox, QPushButton, AlignmentFlag, QPoint } = require('@nodegui/nodegui');
const axios = require('axios').default;
const os = require('os');
const si = require('systeminformation')

const win = new QMainWindow();
win.font
win.setWindowTitle("系統資訊");

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
        'https://gifimage.net/wp-content/uploads/2018/04/loading-text-gif-14.gif'
    );

    gifMovie.setCacheMode(QMovie.CacheAll)
    gifMovie.setSpeed(200)
    gifMovie.setScaledSize(new QSize(300 , 200))
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
            background-color: #000000;
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
            background-color: #ffffff;
        }
        #loadingContainer {
            height: 240px;
            width: 320px;
            flex-direction: 'row';
            flex-wrap: 'wrap';
            justify-content: 'center';
            align-items: 'center';
            background-color: #ffffff;
        }
        #loadingGif {
            width: '100%';
            height: '100%';
        }
        #container {
            flex-direction: 'row';
            flex: 1;
            align-items: 'flex-start';
            width: '100%';
            height: '100%';
        }
        #infoLabel {
            flex: 3;
            background-color: #777777;
            color: 'white';
            height: '100%';
            width: '100%';
        }
        #tabBar {
            flex: 5;
            background-color: white;
            height: '100%';
            align-items: 'center';
            justify-content: 'center'
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
    const container = new QWidget()
    container.setLayout(new FlexLayout());
    container.setObjectName('container')

    const infoLabel = new QListWidget()
    infoLabel.setObjectName('infoLabel')

    const tabBar = new QTabWidget()
    tabBar.setObjectName('tabBar')

    const cpuName = sysInfo.cpu.manufacturer + sysInfo.cpu.brand
    const mbName = sysInfo.baseboard.manufacturer + sysInfo.baseboard.model

    const cpu = new QListWidget()
    const mb = new QListWidget()
    const ram = new QListWidget()
    const gpu = new QListWidget()
    const disk = new QListWidget()

    // cpu
    const cpu_i = new QListWidgetItem()
    cpu_i.setText(cpuName)
    cpu.addItem(cpu_i)

    // mb
    const mb_i = new QListWidgetItem()
    mb_i.setText(mbName)
    mb.addItem(mb_i)

    // ram
    let totalRam = 0
    sysInfo.memLayout.forEach((mem) => {
        let ram_i = new QListWidgetItem()
        ram_i.setText(mem.manufacturer + '-' + mem.partNum)
        ram.addItem(ram_i)
        totalRam = totalRam + mem.size
    })
    // total ram
    let total = new QListWidgetItem()
    total.setText('Total :' + bytesToSize(totalRam))
    ram.addItem(total)

    // disk
    sysInfo.diskLayout.forEach((diskItem) => {
        let disk_i = new QListWidgetItem()
        disk_i.setText(diskItem.name)
        disk.addItem(disk_i)
    })

    // gpu
    sysInfo.graphics.controllers.forEach((gpuItem) => {
        let gpu_i = new QListWidgetItem()
        gpu_i.setText(gpuItem.model)
        gpu.addItem(gpu_i)
    })

    // Listener

    // cpu
    cpu.addEventListener('itemClicked', async (data) => {
        // showModal(sysInfo.cpu)
        infoLabel.clear()
        infoLabel.addItems(await showInfoDetails(sysInfo.cpu))
    })

    // mb
    mb.addEventListener('itemClicked', async (data) => {
        // showModal(sysInfo.baseboard)
        infoLabel.clear()
        infoLabel.addItems(await showInfoDetails(sysInfo.baseboard))
    })

    // disk
    disk.addEventListener('itemClicked', async (data) => {
        infoLabel.clear()
        let itemIndex = disk.row(new QListWidgetItem(data))
        infoLabel.addItems(await showInfoDetails(sysInfo.diskLayout[itemIndex]))
    })

    // ram
    ram.addEventListener('itemClicked', async (data) => {
        let itemIndex = ram.row(new QListWidgetItem(data))
        if (itemIndex !== (ram.count() - 1)) {
            infoLabel.clear()
            infoLabel.addItems(await showInfoDetails(sysInfo.memLayout[itemIndex]))
            // showModal(sysInfo.memLayout[itemIndex])
        }
    })

    // gpu
    gpu.addEventListener('itemClicked', async (data) => {
        let itemIndex = gpu.row(new QListWidgetItem(data))
        infoLabel.clear()
        infoLabel.addItems(await showInfoDetails(sysInfo.graphics.controllers[itemIndex]))
        // showModal(sysInfo.graphics.controllers[itemIndex])
    })

    tabBar.addTab(cpu, new QIcon(), 'CPU')
    tabBar.addTab(mb, new QIcon(), 'MB')
    tabBar.addTab(ram, new QIcon(), 'RAM')
    tabBar.addTab(gpu, new QIcon(), 'GPU')
    tabBar.addTab(disk, new QIcon(), 'SSD & HDD')

    container.layout.addWidget(tabBar)
    container.layout.addWidget(infoLabel)

    return container
}

/**
 * renderView
 * 畫面渲染重讀
 */
const renderView = async () => {
    win.setMinimumSize(600, 400)
    win.setMaximumSize(1200, 800)
    win.show();
    global.win = win;
}

/**
 * showModal
 * message box 通知模式
 * @param {Object} details 
 */
const showModal = async (details) => {
    let str = ''
    for (const [key, value] of Object.entries(details)) {
        str = str + `${key}: ${value} \n`
    }
    const modal = new QMessageBox();
    modal.setText(str);
    const okButton = new QPushButton();
    okButton.setText('OK');
    modal.addButton(okButton);
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
