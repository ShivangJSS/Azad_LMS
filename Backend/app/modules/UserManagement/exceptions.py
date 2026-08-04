class EmailAlreadyExistsError(Exception):
    """
    Raised when user email already exists.
    """
    pass


class UserNotFoundError(Exception):
    """
    Raised when user is not found.
    """
    pass