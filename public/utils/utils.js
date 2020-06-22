import store from '@/store'
import CryptoJS from 'crypto-js'

/** 动态加载js脚本
 * @description: 
 * @param {url} string url
 * @param {callback} fun 回调
 * @return: 
 */
export const loadScript = (url, callback) => {
    // 检测是否加载了 js 文件
    const checkIsLoadScript = (src) => {
        let scriptObjs = document.getElementsByTagName('script');
        for (let sObj of scriptObjs) {
            if (sObj.src == src) {
                return true;
            }
        }
        return false;
    }

    if (checkIsLoadScript(url)) {
        callback();
        return false
    }

    let scriptNode = document.createElement("script");
    scriptNode.setAttribute("type", "text/javascript");
    scriptNode.setAttribute("src", url);
    document.body.appendChild(scriptNode);
    if (scriptNode.readyState) { //IE 判断
        scriptNode.onreadystatechange = () => {
            if (scriptNode.readyState == "complete" || scriptNode.readyState == 'loaded') {
                callback();
            }
        }
    } else {
        scriptNode.onload = () => {
            callback();
        }
    }
}

/** 
 * 判断是否登录 
 */
export const isLogin = () => {
    if (!store.getState().userInfo || !store.getState().userInfo.userId) {
        return false
    } else {
        return true
    }
}

/**
 * 将一维的扁平数组转换为多层级对象，牛逼！
 * @param  {[type]} treeData 一维数组，数组中每一个元素需包含id和pid两个属性 
 * @param  {[type]} parentId 0
 * @return {[type]} tree 多层级树状结构
 */
export const toTreeData = (data,pid) =>{
    function tree(id) {
        let arr = []
        data.filter(item => {
            return item.pid === id;
        }).forEach(item => {
            arr.push({
                ...item,
                children: tree(item.id)
            })
        })
        return arr
    }
    return tree(pid)  // 第一级节点的父id，是null或者0，视情况传入
}