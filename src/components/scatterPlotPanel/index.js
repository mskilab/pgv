import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import ContainerDimensions from "react-container-dimensions";
import handleViewport from "react-in-viewport";
import { Card, Space, Switch, Button, Tooltip, message } from "antd";
import * as d3 from "d3";
import { withTranslation } from "react-i18next";
import { AiOutlineDotChart } from "react-icons/ai";
import Wrapper from "./index.style";
import { AiOutlineDownload } from "react-icons/ai";
import { downloadCanvasAsPng, transitionStyle } from "../../helpers/utility";
import * as htmlToImage from "html-to-image";
import ScatterPlot from "../scatterPlot";

const margins = {
  padding: 0,
};

class ScatterPlotPanel extends Component {
  container = null;

  state = {
    checked: this.props.visible,
  };

  onSwitchChange = (checked) => {
    this.setState({ checked });
  };

  onDownloadButtonClicked = () => {
    htmlToImage
      .toCanvas(this.container, { pixelRatio: 2 })
      .then((canvas) => {
        downloadCanvasAsPng(
          canvas,
          `${this.props.title.replace(/\s+/g, "_").toLowerCase()}.png`
        );
      })
      .catch((error) => {
        message.error(this.props.t("general.error", { error }));
      });
  };

  render() {
    const { t, loading, data, title, inViewport } = this.props;
    const { checked } = this.state;
    if (!data) {
      return null;
    }
    return (
      <Wrapper>
        <Card
          style={transitionStyle(inViewport)}
          loading={loading}
          size="small"
          title={
            <Space>
              <span role="img" className="anticon anticon-dashboard">
                <AiOutlineDotChart />
              </span>
              <span className="ant-pro-menu-item-title">
                <Space>{title}<span><b>{d3.format(",")(data.length)}</b> {t("components.coverage-panel.datapoint", {count: data.length})}</span></Space>
              </span>
            </Space>
          }
          extra={
            <Space>
            <Tooltip title={t("components.visibility-switch-tooltip")}>
              <Switch
                size="small"
                checked={checked}
                onClick={(e) => this.onSwitchChange(e)}
              />
            </Tooltip>
            <Tooltip title={t("components.download-as-png-tooltip")}>
              <Button
                type="default"
                shape="circle"
                icon={<AiOutlineDownload />}
                size="small"
                onClick={() => this.onDownloadButtonClicked()}
              />
            </Tooltip>
          </Space>
          }
        >
          {checked && (<div className="ant-wrapper" ref={(elem) => (this.container = elem)}>
            <ContainerDimensions>
              {({ width, height }) => {
                return (
                  inViewport && <ScatterPlot
                    {...{ width: width - 2 * margins.padding, height: height, results: data}}
                  />
                );
              }}
            </ContainerDimensions>
          </div>)}
        </Card>
      </Wrapper>
    );
  }
}
ScatterPlotPanel.propTypes = {};
ScatterPlotPanel.defaultProps = {};
const mapDispatchToProps = (dispatch) => ({
});
const mapStateToProps = (state) => ({
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation("common")(handleViewport(ScatterPlotPanel, { rootMargin: '-1.0px' })));
