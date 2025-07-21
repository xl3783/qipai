import { gql } from '@apollo/client';

// 消息查询
export const GET_MESSAGES = gql`
  query allMessagesList {
    allMessagesList {
      id
      content
      createdAt
    }
  }
`;

// 添加消息变更
export const ADD_MESSAGE = gql`
  mutation AddMessage($content: String!) {
    addMessage(content: $content) {
      id
      content
      createdAt
    }
  }
`;

// 消息添加subscription
export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    listen(topic: "messageAdded") {
      relatedNodeId
      relatedNode {
        ... on Message {
          id
          content
        }
      }
    }
  }
`;

// 房贷计算历史查询
export const GET_MORTGAGE_HISTORY = gql`
  query GetMortgageHistory {
    mortgageHistory {
      id
      loanAmount
      loanTerm
      interestRate
      paymentMethod
      monthlyPayment
      totalInterest
      totalPayment
      createdAt
    }
  }
`;

// 保存房贷计算历史
export const SAVE_MORTGAGE_CALCULATION = gql`
  mutation SaveMortgageCalculation($input: MortgageCalculationInput!) {
    saveMortgageCalculation(input: $input) {
      id
      loanAmount
      loanTerm
      interestRate
      paymentMethod
      monthlyPayment
      totalInterest
      totalPayment
      createdAt
    }
  }
`;

// 房贷计算更新subscription
export const MORTGAGE_CALCULATION_UPDATED = gql`
  subscription OnMortgageCalculationUpdated {
    listen(topic: "mortgageCalculationUpdated") {
      relatedNodeId
      relatedNode {
        ... on MortgageCalculation {
          id
          loanAmount
          loanTerm
          interestRate
          paymentMethod
          monthlyPayment
          totalInterest
          totalPayment
          createdAt
        }
      }
    }
  }
`; 

// 获取玩家信息
export const GET_PLAYER_PROFILE = gql`
  query GetPlayerProfile($playerId: String!) {
      playerByPlayerId(playerId: $playerId) {
    scoreByPlayerId {
      currentTotal
      gamesLost
      gamesPlayed
      gamesWon
    }
    email
    phone
    playerId
    username
  }
  }
`;