import { Machine } from ".";

Machine({
  initial: "a1",
  id: "foo" as const,
  states: {
    a1: {
      initial: "a2",
      states: {
        a2: {
          initial: "a3",
          states: {
            a3: {},
            b1: {},
            c1: {
              id: "bar" as const,
              initial: "a4",
              states: {
                a4: {
                  on: {
                    A: "#hmm.a8",
                    // @ts-expect-error
                    B: ""
                  },
                  initial: "a5",
                  states: {
                    a5: {
                      initial: "a6",
                      states: {
                        a6: {
                          initial: "a7",
                          states: {
                            a7: {},
                            b2: {},
                            c2: {
                              // @ts-expect-error
                              id: "hmm" as const,
                              initial: "a8",
                              states: {
                                a8: {
                                  
                                }
                              }
                            }
                          }
                        },
                        b3: {},
                        c3: {}
                      }
                    }
                  }
                }
              }
            }
          }
        },
        b4: {},
        c4: {}
      }
    },
    b5: {
      initial: "a9",
      states: {
        a9: {
          initial: "a10",
          states: {
            a10: {},
            b6: {},
            c6: {
              // @ts-expect-error
              id: "hmm" as const,
              initial: "a11",
              states: {
                a11: {
                  initial: "a12",
                  states: {
                    a12: {
                      initial: "a13",
                      states: {
                        a13: {
                          initial: "a14",
                          states: {
                            a14: {},
                            b7: {},
                            c: {
                              initial: "a15",
                              states: {
                                a15: {
                                  
                                }
                              }
                            }
                          }
                        },
                        b8: {},
                        c8: {}
                      }
                    }
                  }
                }
              }
            }
          }
        },
        b9: {},
        c9: {}
      }
    },
    c: {
      initial: "a16",
      id: "baz" as const,
      states: {
        a16: {
          initial: "a17",
          states: {
            a17: {},
            b10: {},
            c10: {
              initial: "a18",
              states: {
                a18: {
                  initial: "a19",
                  states: {
                    a19: {
                      initial: "a20",
                      states: {
                        a20: {
                          initial: "a21",
                          states: {
                            a21: {},
                            b11: {},
                            c11: {
                              initial: "a22",
                              states: {
                                a22: {
                                  
                                }
                              }
                            }
                          }
                        },
                        b12: {},
                        c12: {}
                      }
                    }
                  }
                }
              }
            }
          }
        },
        b13: {},
        c13: {}
      }
    }
  }
})