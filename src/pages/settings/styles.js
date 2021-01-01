import styled from 'styled-components';

export const Options = styled.div`

    .resetOption {
        display: flex;
        flex-direction: column;
    }
`;

export const Option = styled.div`
    display: flex;
    padding: 20px 0 20px;
    line-height: 50px;
`
export const OptionLabel = styled.div`
    font-size: 20px; 
    padding-right: 10px;
`
export const Button = styled.button`
    cursor: pointer;
    font-size: 20px;
    text-align: center;
    display: flex;
    justify-content: center;

    background: #ff8181;
    color: white;
    padding: 8px;
    border-radius: 8px;
    width: 90px;
    outline:none;
    transition: 0.1s;
    &:hover{
    background-color: red;
    }

    .loader {
        margin: 0;
    }
`