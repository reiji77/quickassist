import { render, screen, fireEvent } from '@testing-library/react';
import UserHome from './UserHome';
import EmergencyRequest from './EmergencyRequest'; 
import { LanguageContext } from './App';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('UserHome Component', () => {
  test('renders emergency button with correct label', () => {
    render(
      <LanguageContext.Provider value={{ language: 'English' }}>
        <MemoryRouter initialEntries={['/user/home']}>
          <Routes>
            <Route path="/user/home" element={<UserHome />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>
    );

    // Check if the button with the label "Request Emergency Assistance" is present
    const emergencyButton = screen.getByText('Request Emergency Assistance');
    expect(emergencyButton).toBeInTheDocument();
  });

  test('opens EmergencyRequestOption dialog when emergency button is clicked', () => {
    render(
      <LanguageContext.Provider value={{ language: 'English' }}>
        <MemoryRouter initialEntries={['/user/home']}>
          <Routes>
            <Route path="/user/home" element={<UserHome />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>
    );

    const emergencyButton = screen.getByText('Request Emergency Assistance');
    fireEvent.click(emergencyButton);

    // Check if the EmergencyRequestOption dialog text appears
    const dialogTitle = screen.getByText('Emergency Request');
    expect(dialogTitle).toBeInTheDocument();
  });

  test('shows waiting message after selecting "Text Chat" in EmergencyRequestOption', () => {
    // Set up the localStorage mock to return a chosen language
    localStorage.setItem('language_chosen', 'English');

    render(
      <LanguageContext.Provider value={{ language: 'English' }}>
        <MemoryRouter initialEntries={['/user/home']}>
          <Routes>
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user/emergency_request" element={<EmergencyRequest />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>
    );

    const emergencyButton = screen.getByText('Request Emergency Assistance');
    fireEvent.click(emergencyButton);

    const textChatButton = screen.getByText('Text Chat');
    fireEvent.click(textChatButton);

    const waitingMessage = screen.getByText(/Please wait while we connect you to one of our English speaking health navigators.../i);
    expect(waitingMessage).toBeInTheDocument();
  });

  test('renders emergency button with Vietnamese label when language is set to Vietnamese', () => {
    render(
      <LanguageContext.Provider value={{ language: 'Vietnamese' }}>
        <MemoryRouter initialEntries={['/user/home']}>
          <Routes>
            <Route path="/user/home" element={<UserHome />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>
    );

    // Check if the button with the Vietnamese label is present
    const emergencyButton = screen.getByText('Yêu cầu hỗ trợ khẩn cấp');
    expect(emergencyButton).toBeInTheDocument();
  });

  test('renders navbar with Home, My Account, Health Services, and Settings links in Vietnamese', () => {
    render(
      <LanguageContext.Provider value={{ language: 'Vietnamese' }}>
        <MemoryRouter initialEntries={['/user/home']}>
          <Routes>
            <Route path="/user/home" element={<UserHome />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>
    );

    // Check for specific navbar links in Vietnamese
    expect(screen.getByText('Trang chủ', { selector: 'span' })).toBeInTheDocument(); // Home
    expect(screen.getByText('Tài khoản của tôi', { selector: 'span' })).toBeInTheDocument(); // My Account
    expect(screen.getByText('Dịch vụ y tế', { selector: 'span' })).toBeInTheDocument(); // Health Services
    expect(screen.getByText('Cài đặt', { selector: 'span' })).toBeInTheDocument(); // Settings
  });

  test('renders navbar with Home, My Account, Health Services, and Settings links in English', () => {
    render(
      <LanguageContext.Provider value={{ language: 'English' }}>
        <MemoryRouter initialEntries={['/user/home']}>
          <Routes>
            <Route path="/user/home" element={<UserHome />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>
    );

    // Check for specific navbar links in English
    expect(screen.getByText('Home', { selector: 'span' })).toBeInTheDocument(); // Home
    expect(screen.getByText('My Account', { selector: 'span' })).toBeInTheDocument(); // My Account
    expect(screen.getByText('Health Services', { selector: 'span' })).toBeInTheDocument(); // Health Services
    expect(screen.getByText('Settings', { selector: 'span' })).toBeInTheDocument(); // Settings
  });

  

});
