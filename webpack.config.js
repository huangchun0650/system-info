const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ConfigWebpackPlugin = require("config-webpack");

module.exports = {
  mode: process.NODE_ENV || "development",
  entry: "./src",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: { publicPath: "dist" }
          }
        ]
      },
      {
        test: /\.node$/,
        use: [
          {
            loader: "native-addon-loader",
            options: { name: "[name]-[hash].[ext]" }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  },
  plugins: [
    new ConfigWebpackPlugin("myConfig", {
      "zh": {
        "manufacturer": "製造商",
        "brand": "品牌",
        "vendor": "供應商",
        "family": "家族",
        "model": "機型",
        "stepping": "步進",
        "revision": "修訂",
        "voltage": "電壓",
        "speed": "速度",
        "speedMin": "最小速度",
        "speedMax": "最大速度",
        "cores": "核心數",
        "physicalCores": "物理核心數",
        "processors": "處理器",
        "virtualization": "虛擬化",
        "version": "版本",
        "serial": "順序",
        "assetTag": "資產標籤",
        "memMax": "最大記憶體值",
        "memSlots": "記憶體插槽",
        "size": "容量",
        "bank": "插槽",
        "type": "類型",
        "clockSpeed": "時脈速度",
        "formFactor": "外形規格",
        "partNum": "零件編號",
        "serialNum": "序列號",
        "voltageConfigured": "電壓配置",
        "voltageMin": "最小電壓值",
        "voltageMax": "最大電壓值",
        "bus": "總線控制(器)使用率",
        "vram": "顯存",
        "vramDynamic": "動態顯存",
        "subDeviceId": "子設備 ID",
        "driverVersion": "驅動程序版本",
        "name": "設備名稱",
        "pciBus": "總線",
        "memoryTotal": "顯存總量",
        "memoryUsed": "顯存使用量",
        "memoryFree": "顯存未使用量",
        "temperatureGpu": "顯示卡溫度",
        "device": "裝置",
        "bytesPerSector": "每個扇區的字節數",
        "totalCylinders": "缸總數",
        "totalSectors": "扇區總數",
        "totalTracks": "軌道總數",
        "tracksPerCylinder": "每個缸的軌道數",
        "sectorsPerTrack": "每個軌道的扇區數",
        "firmwareRevision": "固件版本",
        "interfaceType": "接口類型",
        "smartStatus": "狀態"
      }
    })
  ]
};
