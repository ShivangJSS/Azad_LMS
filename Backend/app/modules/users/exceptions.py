class EmailAlreadyExistsError(Exception):
    """Raised when a user email already exists."""
    pass


class UsernameAlreadyExistsError(Exception):
    """Raised when a username already exists."""
    pass


class UserNotFoundError(Exception):
    """Raised when a user is not found."""
    pass


class ParticipantNotFoundError(Exception):
    """Raised when a participant is not found."""
    pass


class RoleNotAllowedError(Exception):
    """Raised when the current user isn't allowed to create/manage the target role."""
    pass


class MissingLocationFieldError(Exception):
    """Raised when a role-required location field (state/district/block/centre) is missing."""
    pass
