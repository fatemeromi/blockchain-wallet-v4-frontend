import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Icon } from '@blockchain-com/constellation'
import { IconArrowDown, IconChevronRight } from '@blockchain-com/icons'

import { Text } from 'blockchain-info-components'
import { DisplayContainer } from 'components/BuySell'
import { Expanded, Flex } from 'components/Flex'
import { Padding } from 'components/Padding'

import { IconContainer } from './SameDayBankTransferCard.styles'
import { SameDayBankTransferCardComponent } from './SameDayBankTransferCard.types'

export const SameDayBankTransferCard: SameDayBankTransferCardComponent = ({ onClick }) => {
  const icon = (
    <IconContainer>
      <Icon label='' color='blue600'>
        <IconArrowDown />
      </Icon>
    </IconContainer>
  )

  const body = (
    <Flex flexDirection='column' gap={4}>
      <Flex flexDirection='column'>
        <Text size='16px' lineHeight='24px' weight={600}>
          <FormattedMessage
            id='modals.simplebuy.same_day_bank_transfer.title'
            defaultMessage='Bank Transfer'
          />
        </Text>
        <Text size='14px' lineHeight='20px' weight={500}>
          <FormattedMessage
            id='modals.simplebuy.same_day_bank_transfer.sub_title'
            defaultMessage='Should arrive same day'
          />
        </Text>
      </Flex>

      <Text size='12px' lineHeight='16px' weight={500} color='grey600'>
        <FormattedMessage
          id='modals.simplebuy.same_day_bank_transfer.content'
          defaultMessage='Transfers are made through the UK Faster Payments System and usually arrive in seconds.'
        />
      </Text>
    </Flex>
  )

  const chevronIcon = (
    <Padding top={4}>
      <Icon label='chevron-right' color='grey700' size='sm'>
        <IconChevronRight />
      </Icon>
    </Padding>
  )

  return (
    <DisplayContainer onClick={onClick}>
      <Expanded>
        <Flex gap={16}>
          {icon}

          <Expanded>{body}</Expanded>

          {chevronIcon}
        </Flex>
      </Expanded>
    </DisplayContainer>
  )
}
