import { i18n } from "@lingui/core"
import { t } from "@lingui/macro"
import Container from "app/components/Container"
import Head from "next/head"

const veCRONA = () => {
  return (
    <Container id="veCRONA-page" className="p-4 md:py-8 lg:py-24" maxWidth="8xl">
      <Head>
        <title>{i18n._(t`veCRONA`)} | Cronaswap</title>
        <meta
          key="description"
          name="description"
          content="Cronaswap allows for swapping of ERC20 compatible tokens across multiple networks"
        />
      </Head>
    </Container>)
}

export default veCRONA