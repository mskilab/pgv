import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { Layout, Menu, Space, Spin } from "antd";
import {
  AiOutlineDashboard,
  AiOutlineTable
} from "react-icons/ai";
import { LoadingOutlined } from "@ant-design/icons";
import TopbarWrapper from "./topbar.style";
import { siteConfig } from "../../settings";
import logo from "../../assets/images/logo.png";

const { Header } = Layout;

const navigationMap = { 
  "/": "dashboard",
  "/data-selection/": "data-selection"
}

class Topbar extends Component {
  state = {
    currentPage: "",
    visible: false
  };

  handleClick = (e) => {
    this.setState({ currentPage: e.key });
  };

  componentWillReceiveProps(nextProps) {
    // to update the navigation when page refresh
    let pathname = new URL(decodeURI(document.location)).pathname;
    this.setState({ currentPage: navigationMap[pathname] });
  }

  render() {
    const { currentPage } = this.state;
    const { t, file, domain, loading } = this.props;
    let params = file && `?file=${file}&from=${domain[0]}&to=${domain[1]}`;

    return (
      <TopbarWrapper>
        <Header className="ant-pro-top-menu">
          <div className="ant-pro-top-nav-header light">
            <div className="ant-pro-top-nav-header-main ">
              <div className="ant-pro-top-nav-header-main-left">
                <div
                  className="ant-pro-top-nav-header-logo"
                  id="logo"
                  onClick={() => this.handleClick({ key: "dashboard" })}
                >
                  <Link to={`/${params}`}>
                    <img src={logo} alt="logo" />
                    <h1>{siteConfig.siteName}</h1>
                  </Link>
                </div>
              </div>
              <div className="ant-pro-top-nav-header-menu">
                <Menu
                  mode="horizontal"
                  onClick={this.handleClick}
                  selectedKeys={[currentPage]}
                >
                  <Menu.Item key="data-selection">
                    <Link to={`/data-selection/${params}`}>
                      <span role="img" className="anticon anticon-dashboard">
                        <AiOutlineTable />
                      </span>
                      <span className="ant-pro-menu-item-title">
                        {t("menu.data-selection.title")}
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="dashboard">
                    <Link to={`/${params}`}>
                      <span role="img" className="anticon anticon-dashboard">
                        <AiOutlineDashboard />
                      </span>
                      <span className="ant-pro-menu-item-title">
                        {t("menu.home.title")}
                      </span>
                    </Link>
                  </Menu.Item>
                </Menu>
              </div>
              <div className="ant-pro-top-nav-header-main-right">
                <div className="ant-pro-top-nav-header-main-right-container">
                  <Space align="center">
                    <div className="ant-pro-loader-container">
                      {loading && <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 16 }} spin />
                        }
                      />}
                    </div>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        </Header>
      </TopbarWrapper>
    );
  }
}
Topbar.propTypes = {
  file: PropTypes.string,
};
Topbar.defaultProps = {
  currentPage: ""
};
const mapDispatchToProps = (dispatch) => ({
});
const mapStateToProps = (state) => ({
  file: state.App.file,
  domain: state.App.domain,
  loading: state.App.loading
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation("common")(Topbar));
