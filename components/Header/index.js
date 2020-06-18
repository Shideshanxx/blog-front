import React, { useState, useEffect  } from 'react';
import { Row, Col, Menu, Icon, Drawer, Input, Avatar, Badge, message, Dropdown } from 'antd';
import Link from 'next/link';
const { Search } = Input;
import Login from '../Login';
import './style.less';

import classnames from 'classnames';
import Router, {withRouter} from 'next/router';
import { connect } from 'react-redux';
import request from '@/public/utils/request';
import serviceApi from '@/config/service';

function Header(props) {
    const [scrollActive, setScrollActive] = useState(false)
	const [isHome, setIsHome] = useState(false)
	const [muneVisible, setMuneVisible] = useState(false)
    const [searchVal, setSearchVal] = useState('')

    const { userInfo, msgData } = props;

    // 进度条
	const scrollHandler = () => {
		let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
		if (scrollTop >= 200) {
			setScrollActive(true)
		} else {
			setScrollActive(false)
		}
    }

    Router.events.on('routeChangeComplete', (...args) => {
		if (location.pathname === '/index' || location.pathname == '/') {
			setIsHome(true)
			scrollHandler();
			window.addEventListener('scroll', scrollHandler, false);
		} else {
			setIsHome(false)
			setScrollActive(false)
			window.removeEventListener('scroll', scrollHandler, false)
		}
    })
    
    // 切换目录,跳转到列表页
	const selectChang = (item) => {
		Router.push({
			pathname: '/list',
			query: {
				type: item.key
			}
		})
    }
    
    // 搜索
	const onPressEnterLink = () => {
		window.location.href = `/search?type=0&&page=1&&searchVal=${searchVal}`
    }
    
    useEffect(() => {
		if (location.pathname === '/index' || location.pathname == '/') {
			scrollHandler();
			setIsHome(true)
			window.addEventListener('scroll', scrollHandler, false);
		}

		if (props.router.query.searchVal) {
			setSearchVal(props.router.query.searchVal)
		}

		// 判断localStorage是否有用户信息 有 存入redux
		if (JSON.parse(localStorage.getItem('userInfo')) && JSON.parse(localStorage.getItem('userInfo')).token) {
			// 存入react-redux
			props.userInfoChange(JSON.parse(localStorage.getItem('userInfo')))
		}

		if (props.router.query.code) {
			request(serviceApi.getWeiboUserInfo, {
				method: 'get',
				params: {
					code: props.router.query.code,
				}
			}).then((res) => {
				if (res && res.code == 200) {
					localStorage.setItem("userInfo", JSON.stringify(res.data));

					message.success('登陆成功！')
					// 存入react-redux
					props.userInfoChange(res.data)
					// 清掉路由信息
					Router.replace('/')
				}
			})
		}

		// 注销解绑事件
		return function cleanup() {
			if (location.pathname === '/index' || location.pathname == '/') {
				window.removeEventListener('scroll', scrollHandler, false)
			}
		}
    }, [])
    
    // 弹出登录弹窗
    const showLogin = () => {
        Login.show()
    }

    // 跳转到后台写文章
	const writeArticle = () =>{
		if(~~props.userInfo.auth > 0){
			window.open('http://admin.zjutshideshan.com')
		}else{
			message.warning('抱歉,写文章的权限暂仅对内部博主开放！')
		}
    }
    
    // 退出登录
	const logout = () => {
		props.userInfoChange(null);
		localStorage.setItem("userInfo", null);
		message.success('退出成功！')

		// 清掉路由信息
		Router.replace('/')
	}
    
    // 跳转到个人中心
    const linkUser = (id) => {
		// 重复路由的处理 不是很优雅（暂时想不到优雅的写法）
 		if(props.router.pathname === '/userCenter'){
			Router.push({
				pathname: '/userCenter',
				query: { id }
			}).then(()=>{
				Router.reload()
			})
		}
		Router.push({
			pathname: '/userCenter',
			query: { id }
		})
	}

    return (
		<div className={classnames({ 'header': true, 'homeHeader': isHome, 'scrollActive': scrollActive })}>
			<Row className={classnames('wrap header-box')} type="flex" align="middle" justify="space-between">
				<Col className="left-logo" xs={24} sm={24} md={10} lg={10} xl={10}>
					<Link href="./index">
						<a className="logo-title">石德山</a>
					</Link>
					<span className="logo-text">专注前端开发与知识分享</span>
				</Col>

                {/* PC端 */}
				<Col className="right-memu" xs={0} sm={0} md={0} lg={8} xl={6}>
					<Search
						className={classnames('search-input search-pc')}
						placeholder="请开始你的表演"
						value={searchVal}
						onChange={(e) => setSearchVal(e.target.value)}
						onSearch={onPressEnterLink}
					/>
					{
						userInfo && userInfo.userId ?
							<div className="user-box">
								{/* 登录	 */}
								<Badge dot={msgData && msgData.length ? true : false}>
									<Avatar className="user-avatar" src={userInfo && userInfo.avatar} />
								</Badge>

								<div className="user-info">

									<p className="user-name">{userInfo && userInfo.userName}</p>


									<div className="info-box">

										<div className="item">
											<p className="title">文章</p>
											{userInfo && userInfo.aNum}
										</div>

										<div className="item">
											<p className="title">粉丝</p>
											{userInfo && userInfo.fNum}
										</div>

										<div className="item">
											<p className="title">获赞</p>
											{userInfo && userInfo.cNum}
										</div>
									</div>

									<ul className="user-options">
										<li onClick={ ()=>linkUser(userInfo.userId)}>
											<Icon type="user" /> 个人中心
										</li>

										<li className="user-msg" onClick={() => Router.push(`/msgCenter`)} >
											<Icon type="bell" /> 我的信息

											<span className="msg-num">
												<Badge
													count={msgData && msgData.length}
													style={{ backgroundColor: 'rgba(245,34,45,.2)', color: 'red', boxShadow: 'none' }}
												/>
											</span>
										</li>

										<li onClick={logout}>
											<Icon type="poweroff" /> 退出
										</li>
									</ul>

								</div>
							</div>
							: null
					}


					<Menu mode="horizontal" theme="null" onSelect={selectChang}>
						<Menu.Item key="1">
							<a>
								<Icon type="experiment" />
								技术
							</a>
						</Menu.Item>
						<Menu.Item key="2">

							<a>
								<Icon type="camera" />
								摄影
							</a>

						</Menu.Item>
						<Menu.Item key="3">
							<a>
								<Icon type="coffee" />
								生活
							</a>
						</Menu.Item>
					</Menu>

					{
						userInfo && userInfo.userId ?
						<div key="1" className="writing" onClick={writeArticle}>
							<Icon type="highlight" style={{ fontSize: 16, marginRight: 10 }} />
							写文章
						</div>
						:
						<div key="2" className="writing" onClick={showLogin}>
							<Icon type="desktop" style={{ fontSize: 16, marginRight: 10 }} />
							登录
						</div>
					}

				</Col>

				{/* 移动端 menu */}
				<div className="xs-menu" id="xs-menu">
                    
				{
					userInfo && userInfo.userId ?
					<Dropdown 
						getPopupContainer={() => document.getElementById('xs-menu')} 
						placement="bottomRight" 
						trigger={['click']} 
						overlayStyle={{width: '100%',left: 0}}
						overlay={
							<ul className="user-options">
								<li onClick={ ()=>linkUser(userInfo.userId)}>
									<Icon type="user" /> 个人中心
								</li>

								<li className="user-msg" onClick={() => Router.push(`/msgCenter`)} >
									<Icon type="bell" /> 我的信息

									<span className="msg-num">
										<Badge
											count={msgData && msgData.length}
											style={{ backgroundColor: 'rgba(245,34,45,.2)', color: 'red', boxShadow: 'none' }}
										/>
									</span>
								</li>

								<li onClick={logout}>
									<Icon type="poweroff" /> 退出
								</li>
							</ul>
					}>
						<Badge dot={msgData && msgData.length ? true : false}>
							<Avatar className="user-avatar" src={userInfo && userInfo.avatar} />
						</Badge>

					</Dropdown>:null
				}

				{
						userInfo && userInfo.userId ?
						null
						:
						<div key="2" className="writing" onClick={showLogin}>
							<Icon type="mobile" theme="twoTone" style={{ fontSize: 18, marginRight: 5,marginTop: 2 }} />
							登录
						</div>
				
				}
				<Icon style={{ fontSize: 20,marginLeft: 20 }} type="menu" onClick={() => setMuneVisible(true)} />

				</div>

				{/* 移动端弹出层 */}
				<Drawer
					title="博客"
					placement="right"
					closable={false}
					onClose={() => setMuneVisible(false)}
					visible={muneVisible}
					bodyStyle={{ padding: 0 }}
				>
					<Search
						style={{ margin: '24px auto' }}
						className={classnames('search-input search-h5')}
						placeholder="请开始你的表演"
						value={searchVal}
						onChange={(e) => setSearchVal(e.target.value)}
						onSearch={onPressEnterLink}
					/>


					<Menu mode="vertical" style={{ border: 'none' }} onClick={() => setMuneVisible(false)}>
						<Menu.Item key="1">
							<Link href="./list?type=1">
								<a>
									<Icon type="experiment" />
									技术
								</a>
							</Link>
						</Menu.Item>
						<Menu.Item key="2">
							<Link href="./list?type=2">
								<a>
									<Icon type="camera" />
									摄影
								</a>
							</Link>
						</Menu.Item>
						<Menu.Item key="3">
							<Link href="./list?type=3">
								<a>
									<Icon type="coffee" />
									生活
								</a>
							</Link>
						</Menu.Item>
					</Menu>


				</Drawer>
			</Row>
		</div>
	)
}

const stateToProps = (state) => {
	return {
		userInfo: state.userInfo,
		msgData: state.msgData,
		loginLoading: state.loginLoading
	}
}

const dispatchToProps = (dispatch) => {
	return {
		userInfoChange(obj) {
			let action = {
				type: 'changeUserInfo',
				payload: obj
			}

			dispatch(action)
		}
	}
}

export default withRouter(connect(stateToProps, dispatchToProps)(Header))