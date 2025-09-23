import * as yup from "yup";

export const inviteMemberSchema = yup
  .object()
  .shape({
    email: yup.string().email("Invalid email format").optional(),
    selectedUsers: yup.array().of(yup.string()).optional(),
  })
  .test("at-least-one-required", "Either email or selectedUsers is required", function (value) {
    return !!(value.email || (value.selectedUsers && value.selectedUsers.length > 0));
  });

  