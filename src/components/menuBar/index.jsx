import React from 'react';
import {useTranslate} from 'react-translate';
import {Home, ChartBar, Adjustments, BookOpen } from '@styled-icons/heroicons-outline';
import { Container, Logo, MenuList, MenuItem } from './styles';
import logo from '../../assets/bethere_logo.png';

const MenuBar = () => {
  const translate = useTranslate('menu');

  const menuArray = [
    {
      Icon: () => <Home />,
      text: translate('home'),
      path: '/'
    },
    {
      Icon: () => <BookOpen />,
      text: translate('history'),
      path: '/history'
    },
    /* {
      Icon: () => <ChartBar />,
      text: 'Charts',
      path: '/charts'
    }, */
    {
      Icon: () => <Adjustments />,
      text: translate('settings'),
      path: '/settings'
    }
  ]
  return (
    <Container>
      <Logo>
        <img src={logo} alt=""/>
      </Logo>
      <MenuList>
        {menuArray.map(({Icon, path, text}) => 
          <MenuItem exact activeClassName="selectedItem" to={path} key={text}>
            <Icon />
            {text}
          </MenuItem>
        )}
      </MenuList>
    </Container>
  );
}

export default MenuBar;