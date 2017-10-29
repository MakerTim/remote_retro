//
// Reusable, domain-specific prop types
//
import PropTypes from "prop-types"

export const alert = PropTypes.object

// could be an enum if this is a fixed set of strings?
export const category = PropTypes.string

export const user = PropTypes.shape({
  given_name: PropTypes.string,
  online_at: PropTypes.number,
  is_facilitator: PropTypes.boolean,
})

export const users = PropTypes.arrayOf(PropTypes.object)

export const retroChannel = PropTypes.shape({
  on: PropTypes.func,
  push: PropTypes.func,
})

export const idea = PropTypes.shape({
  id: PropTypes.number,
  user: PropTypes.object,
  body: PropTypes.string,
  category,
})

export const stage = PropTypes.oneOf([
  "prime-directive",
  "idea-generation",
  "voting",
  "action-items",
  "closed",
])

export const votes = PropTypes.arrayOf(PropTypes.object)

export const ideas = PropTypes.arrayOf(idea)

