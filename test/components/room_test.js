import React from "react"
import { shallow, mount } from "enzyme"
import { expect } from "chai"
import { spy } from "sinon"

import Room from "../../web/static/js/components/room"
import CategoryColumn from "../../web/static/js/components/category_column"
import RetroChannel from "../../web/static/js/services/retro_channel"
import StageProgressionButton from "../../web/static/js/components/stage_progression_button"

describe("Room component", () => {
  const mockRetroChannel = { push: spy(), on: () => {} }
  const stubbedPresence = { user: { given_name: "Mugatu" } }

  describe(".handleIdeaSubmission", () => {
    it("pushes the idea to the room channel", () => {
      const roomComponent = shallow(
        <Room currentPresence={stubbedPresence} retroChannel={mockRetroChannel} users={[]} />
      )

      roomComponent
        .instance()
        .handleIdeaSubmission({ category: "sad", body: "we don't use our linter" })

      expect(
        mockRetroChannel.push.calledWith("new_idea", { category: "sad", body: "we don't use our linter" })
      ).to.equal(true)
    })
  })

  context("when the current user is facilitator", () => {
    context("and showActionItems is false", () => {
      it("renders the <StageProgressionButton>", () => {
        const roomComponent = shallow(
          <Room
            currentPresence={stubbedPresence}
            retroChannel={mockRetroChannel}
            isFacilitator
            users={[]}
          />
        )

        expect(roomComponent.find(StageProgressionButton)).to.have.length(1)
      })
    })

    context("and showActionItems is true", () => {
      it("does not render the <StageProgressionButton>", () => {
        const roomComponent = shallow(
          <Room
            currentPresence={stubbedPresence}
            retroChannel={mockRetroChannel}
            isFacilitator
            users={[]}
          />
        )
        roomComponent.setState({ showActionItem: true })

        expect(roomComponent.find(StageProgressionButton)).to.have.length(0)
      })
    })
  })

  context("when the current user is not facilitator", () => {
    it("does not render <StageProgressionButton>", () => {
      const roomComponent = shallow(
        <Room
          currentPresence={stubbedPresence}
          retroChannel={mockRetroChannel}
          users={[]}
        />
      )

      expect(roomComponent.find(StageProgressionButton)).to.have.length(0)
    })
  })

  context("when onProceedToActionItems property is fired by <StageProgressionButton>", () => {
    const retroChannel = { push: spy() }

    before(() => {
      const wrapper = shallow(
        <Room
          currentPresence={stubbedPresence}
          retroChannel={retroChannel}
          isFacilitator
          users={[]}
        />
      )

      wrapper.find(StageProgressionButton).props().onProceedToActionItems()
    })

    it("pushes a show_action_item event with a `show_action_item` value of true", () => {
      expect(retroChannel.push.calledWith("show_action_item", { show_action_item: true }))
        .to.eql(true)
    })
  })

  describe("Action item column", () => {
    it("is not visible on render", () => {
      const roomComponent = shallow(
        <Room currentPresence={stubbedPresence} retroChannel={mockRetroChannel} users={[]} />
      )

      expect(roomComponent.containsMatchingElement(
        <CategoryColumn category="action-item" ideas={[]} retroChannel={mockRetroChannel} />
      )).to.equal(false)
    })

    it("becomes visible when showActionItem is true", () => {
      const roomComponent = shallow(
        <Room currentPresence={stubbedPresence} retroChannel={mockRetroChannel} users={[]} />
      )
      roomComponent.setState({ showActionItem: true })

      expect(roomComponent.containsMatchingElement(
        <CategoryColumn category="action-item" ideas={[]} retroChannel={mockRetroChannel} />
      )).to.equal(true)
    })
  })

  describe("RetroChannel Events", () => {
    let retroChannel
    let roomComponent

    beforeEach(() => {
      retroChannel = RetroChannel.configure({})
      roomComponent = mount(
        <Room currentPresence={stubbedPresence} retroChannel={retroChannel} users={[]} />
      )
    })

    describe("on `existing_ideas`", () => {
      it("sets the associated payload's `ideas` value on state", () => {
        expect(roomComponent.state("ideas")).to.eql([])

        const mockPayloadFromServer = { ideas: [{ arbitrary: "content" }] }
        retroChannel.trigger("existing_ideas", mockPayloadFromServer)

        expect(roomComponent.state("ideas")).to.eql([
          { arbitrary: "content" },
        ])
      })
    })

    describe("on `new_idea_received`", () => {
      it("pushes the value passed in the payload into the `ideas` array", () => {
        roomComponent.setState({ ideas: [{ body: "first idear" }] })

        retroChannel.trigger("new_idea_received", { body: "zerp" })

        expect(roomComponent.state("ideas")).to.eql([
          { body: "first idear" },
          { body: "zerp" },
        ])
      })
    })

    describe("on `set_show_action_item`", () => {
      it("updates the state for showActionItem to the value from set_show_action_item", () => {
        expect(roomComponent.state("showActionItem")).to.eql(false)
        retroChannel.trigger("set_show_action_item", { show_action_item: true })

        expect(roomComponent.state("showActionItem")).to.eql(true)
      })
    })

    describe("on `enable_edit_state`", () => {
      it("updates the idea with matching id, setting `editing` to true", () => {
        const ideas = [
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ]

        roomComponent.setState({ ideas })

        retroChannel.trigger("enable_edit_state", { id: 2 })

        expect(roomComponent.state("ideas")[1]).to.eql({ id: 2, editing: true })
      })
    })

    describe("on `disable_edit_state`", () => {
      it("updates the idea with matching id, setting `editing` to false", () => {
        const ideas = [
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ]

        roomComponent.setState({ ideas })

        retroChannel.trigger("disable_edit_state", { id: 3 })

        expect(roomComponent.state("ideas")[2]).to.eql({ id: 3, editing: false })
      })
    })

    describe("on `idea_deleted`", () => {
      it("removes the idea passed in the payload from state.ideas", () => {
        roomComponent.setState({ ideas: [{ id: 6, body: "turtles" }] })
        retroChannel.trigger("idea_deleted", { id: 6 })

        expect(roomComponent.state("ideas")).to.eql([])
      })
    })

    describe("on `idea_edited`", () => {
      let ideas
      let editedIdea

      beforeEach(() => {
        ideas = [
          { id: 1 },
          { id: 2, body: "i like turtles", editing: true },
          { id: 3 },
        ]

        roomComponent.setState({ ideas })
        retroChannel.trigger("idea_edited", { id: 2, body: "i like TEENAGE MUTANT NINJA TURTLES" })
        editedIdea = roomComponent.state("ideas").find(idea => (idea.id === 2))
      })

      it("updates the idea with matching id on state", () => {
        expect(editedIdea.body).to.eql("i like TEENAGE MUTANT NINJA TURTLES")
      })

      it("sets the idea's `editing` value to false", () => {
        expect(editedIdea.editing).to.eql(false)
      })
    })
  })
})
