// import Footer from 'components/Footer'
import Header from 'components/Header'
import Main from 'components/Main'
import Popups from 'components/Popups'

const Layout = ({ children }) => {
  return (
    <div className="z-0 flex flex-col items-center w-full h-screen pb-16 lg:pb-0 bg-gray-50 dark:bg-gray-800 transition-all">
      <Header />
      <Main>{children}</Main>
      <Popups />
      {/* <Footer /> */}
    </div>
  )
}

export default Layout
