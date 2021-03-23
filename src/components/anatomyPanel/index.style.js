import styled from "styled-components";

const Wrapper = styled.div`
  .ant-wrapper {
    background: white;
    padding: 0px;
    ${props => !props.empty && "height: 400px"};
  }
`;

export default Wrapper;
