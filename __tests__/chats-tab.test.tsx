import React from 'react'
import { render } from '@testing-library/react-native'
import ChatsTab from '@/app/(tabs)/chat'

jest.mock('@/app/(chat)/useChats', () => ({
  useChats: () => ({
    conversations: [],
    loading: false,
    error: null,
    navigateToChat: jest.fn(),
  }),
}))

jest.mock('@/components/chat-card', () => ({
  ChatCard: () => null,
}))

describe('ChatsTab', () => {
  it('renders the chats screen', () => {
    const { getByText } = render(<ChatsTab />)
    expect(getByText('No conversations yet')).toBeTruthy()
  })
})
